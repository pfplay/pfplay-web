import { useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useHandlePartyroomSubscriptionEvent,
  usePartyroomClient,
} from '@/entities/partyroom-client';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { partyroomsService } from '@/shared/api/http/services';
import { MotionType } from '@/shared/api/http/types/@enums';
import { EnterResponse, PartyroomReaction } from '@/shared/api/http/types/partyrooms';
import type { EntrySource } from '@/shared/lib/analytics/events';
import { trackPartyroomEntered } from '@/shared/lib/analytics/room-tracking';
import silent from '@/shared/lib/functions/silent';
import { useAppRouter } from '@/shared/lib/router/use-app-router.hook';
import { useStores } from '@/shared/lib/store/stores.context';
import {
  createSubscriptionEventBuffer,
  type SubscriptionEventBuffer,
} from './subscription-event-buffer';
import { useEnterPartyroom as useEnterPartyroomMutation } from '../api/use-enter-partyroom.mutation';

type Options = {
  entrySource?: EntrySource;
};

/**
 * 구독 등록 지연을 넉넉히 덮는 보정 시점. 측정된 지연은 수십 ms 수준이라 1s 면 충분한 여유가 있고,
 * 초기 렌더 이후에 도는 보정이라 늦어도 사용자 체감엔 영향이 없다.
 */
const CREWS_RECONCILE_DELAY_MS = 1_000;

export function useEnterPartyroom(partyroomId: number, options: Options = {}) {
  const client = usePartyroomClient();
  const handleEvent = useHandlePartyroomSubscriptionEvent();
  const { useCurrentPartyroom } = useStores();
  const initPartyroom = useCurrentPartyroom((state) => state.init);
  const { mutate: enter } = useEnterPartyroomMutation();
  const queryClient = useQueryClient();
  const router = useAppRouter();

  const entrySource: EntrySource = options.entrySource ?? 'direct';

  // #491 구독 핸들러는 방마다 1회만 등록되지만 handleEvent 는 렌더마다 새로 만들어진다.
  // ref 로 최신 핸들러를 가리켜 버퍼가 stale closure 를 잡지 않게 한다.
  const handleEventRef = useRef(handleEvent);
  handleEventRef.current = handleEvent;
  const eventBufferRef = useRef<SubscriptionEventBuffer>();
  if (!eventBufferRef.current) {
    eventBufferRef.current = createSubscriptionEventBuffer(() => handleEventRef.current);
  }
  const eventBuffer = eventBufferRef.current;

  /**
   * #491 구독 등록 지연 보정 (self-heal).
   *
   * `SUBSCRIBE` 프레임을 보낸 시각과 브로커가 실제로 구독을 등록하는 시각 사이에는 간격이 있고,
   * STOMP 는 SUBSCRIBE 에 ack 가 없어(Spring `enableSimpleBroker` 는 DISCONNECT 에만 RECEIPT 를
   * 보낸다) 클라이언트가 등록 완료를 알 방법이 없다. 그래서 구독을 스냅샷보다 먼저 보내도
   * "프레임 전송 ~ 등록 완료" 사이의 `CREW_ENTERED` 는 여전히 유실될 수 있다
   * (측정: 유실률 37.5% → 8%, 구독-스냅샷 사이에 500ms 를 강제로 넣으면 0%).
   *
   * 등록이 확실히 끝났을 시점에 crews 스냅샷을 한 번 다시 맞춰 그 잔여분을 복구한다. 초기 렌더는
   * 이미 첫 스냅샷으로 끝났으므로 사용자 체감 지연은 없다. 재조회 중 도착분은 버퍼가 보류했다가
   * 재생하므로, 뒤늦게 적용되는 스냅샷이 그 사이 이벤트를 덮지 않는다.
   */
  const scheduleCrewsReconcile = () => {
    setTimeout(async () => {
      // 방을 떠났거나 다른 방으로 옮겼으면 낡은 방의 crews 로 덮지 않는다.
      if (useCurrentPartyroom.getState().id !== partyroomId) return;

      eventBuffer.hold();
      try {
        const setUpInfo = await partyroomsService.getSetupInfo({ partyroomId });
        if (useCurrentPartyroom.getState().id !== partyroomId) return;

        const motionTypeMap = crewIdToMotionTypeMap(setUpInfo.display.reaction?.motion);
        const { crews: currentCrews, updateCrews } = useCurrentPartyroom.getState();
        const currentById = new Map(currentCrews.map((crew) => [crew.crewId, crew]));
        const membershipMatches =
          currentCrews.length === setUpInfo.crews.length &&
          setUpInfo.crews.every((crew) => currentById.has(crew.crewId));

        // 어긋난 게 없으면 스토어를 건드리지 않는다. 대부분의 입장은 이 경로로,
        // 불필요한 리렌더나 라이브 상태 손실이 생기지 않는다.
        if (membershipMatches) return;

        updateCrews(() =>
          setUpInfo.crews.map((crew) => {
            // 이미 있는 크루는 스토어 객체를 그대로 둔다 — 스냅샷에 없는 라이브 필드
            // (모션·반응·마지막 채팅)를 보정이 되돌리지 않도록.
            const existing = currentById.get(crew.crewId);
            return existing ?? { ...crew, motionType: motionTypeMap.get(crew.crewId) ?? MotionType.NONE };
          })
        );
      } catch {
        // 보정 실패는 조용히 넘긴다 — 원래 상태를 유지할 뿐 악화시키지 않는다.
      } finally {
        eventBuffer.release();
      }
    }, CREWS_RECONCILE_DELAY_MS);
  };

  const setup = async (enterResponse: EnterResponse) => {
    // L1: 방 enter/재수화 시작 시 무조건 clear — 이전 방 스냅샷이 새 방 채팅에 방출되는 누출 방지
    useCurrentPartyroom.getState().playbackSummaryTracker.clear();

    const [setUpInfo, notice] = await Promise.all([
      partyroomsService.getSetupInfo({ partyroomId }),
      partyroomsService.getNotice({ partyroomId }), // 공지사항은 현재 설계상 enter 시점엔 rest api로 받아오고, 이후 공지 변경이 있을 땐 웹 소켓 이벤트로 수신합니다.
    ]);

    // TODO: crews 작업 시 crews 캐시 데이터 세팅해주기
    // queryClient.setQueryData([QueryKeys.PartyroomCrews, partyroomId], setUpInfo.crews);

    const motionTypeMap = crewIdToMotionTypeMap(setUpInfo.display.reaction?.motion);

    initPartyroom(
      omitNullables({
        id: partyroomId,
        me: {
          crewId: enterResponse.crewId,
          gradeType: enterResponse.gradeType,
        },
        playbackActivated: setUpInfo.display.playbackActivated,
        playback: setUpInfo.display.playback,
        reaction: setUpInfo.display.reaction,
        crews: setUpInfo.crews.map((crew) => ({
          ...crew,
          motionType: motionTypeMap.get(crew.crewId) ?? MotionType.NONE,
        })),
        currentDj: setUpInfo.display.currentDj,
        notice: notice.content ?? '',
      })
    );

    // 시드② — 곡 진행 중 입장/재수화 시 setup 데이터로 스냅샷 복원.
    // setup await 중 새 곡 PLAYBACK_STARTED가 먼저 시드된 레이스는 추적기 내부 규칙(L3/L4)이 방어.
    const currentDjCrewId = setUpInfo.display.currentDj?.crewId;
    const djNickname =
      currentDjCrewId === undefined
        ? null
        : (setUpInfo.crews.find((crew) => crew.crewId === currentDjCrewId)?.nickname ?? null);
    useCurrentPartyroom.getState().playbackSummaryTracker.seedFromSetup({
      playback: setUpInfo.display.playback
        ? {
            name: setUpInfo.display.playback.name,
            linkId: setUpInfo.display.playback.linkId,
            endTime: setUpInfo.display.playback.endTime,
          }
        : undefined,
      counts: setUpInfo.display.reaction
        ? {
            like: setUpInfo.display.reaction.aggregation.likeCount,
            dislike: setUpInfo.display.reaction.aggregation.dislikeCount,
            grab: setUpInfo.display.reaction.aggregation.grabCount,
          }
        : undefined,
      djNickname,
      now: Date.now(),
    });

    trackPartyroomEntered({
      partyroomId,
      crewCount: setUpInfo.crews.length,
      entrySource,
      stageType: setUpInfo.stageType,
    });
  };

  return () => {
    client.onConnect(
      () => {
        // #469 재연결 resync 를 단일 슬롯으로 등록한다. skipCurrent 라 현재 연결엔 미발화(초기 enter 가
        // 담당)하고 이후 재연결에만 동작하며, teardown 의 unsubscribeCurrentRoom 이 해제하므로
        // 방마다 onConnectQueue 에 누적되지 않는다 (기존 firstConnect ref 꼼수 제거).
        client.setRoomReconnectHandler(() => {
          // L2: 재연결마다 clear — 끊김이 곡 경계를 넘었을 때 낡은 스냅샷에 새 곡 counts가 오염된
          // 틀린 구획 방출 방지. disconnect 콜백이 공개돼 있지 않아 재연결 시점 clear가 의미상 등가
          // (끊김~재연결 사이엔 방출/시드 이벤트가 처리되지 않음). 놓친 경계는 기념하지 않는다.
          useCurrentPartyroom.getState().playbackSummaryTracker.clear();
          enter(
            { partyroomId },
            {
              onSuccess: (enterResponse) => {
                const invalidateDjQueue = () =>
                  queryClient.invalidateQueries({ queryKey: [QueryKeys.DjingQueue, partyroomId] });
                if (enterResponse.reactivated) {
                  // 멤버십 상실 → 풀 재수화(검정 해소). 룸 재구독은 추가하지 않음(handleConnect 가 이미 reconcile).
                  // #491 재수화도 스냅샷 경계를 다시 지난다 — 적용 전 도착분을 보류했다가 재생한다.
                  // 실패 경로에선 보류를 풀지 않는다(로비로 나가므로 낡은 이벤트를 재생할 이유가 없다).
                  eventBuffer.hold();
                  silent(setup(enterResponse), {
                    onSuccess: () => {
                      eventBuffer.release();
                      invalidateDjQueue();
                    },
                    onError: () => router.push('/parties'),
                  });
                } else {
                  // 멤버십 유지 → 경량(플레이어/구독 무영향)
                  invalidateDjQueue();
                }
              },
              onError: () => router.push('/parties'),
            }
          );
        });

        enter(
          { partyroomId },
          {
            onSuccess: (enterResponse) => {
              // #491 스냅샷(GET /setup)보다 **먼저** 구독한다. 반대 순서였을 때는 스냅샷 생성 시점부터
              // 구독이 브로커에 등록되기까지의 이벤트가 통째로 유실됐고(동시 입장 시 상대 크루가
              // 영원히 안 보임), 자가치유 경로가 없어 새로고침 전까지 복구되지 않았다.
              // 스냅샷 적용 전 도착분은 버퍼가 보류했다가 initPartyroom 이후 재생한다.
              eventBuffer.hold();
              client.subscribe(partyroomId, eventBuffer.handle);

              silent(setup(enterResponse), {
                onSuccess: () => {
                  eventBuffer.release();
                  queryClient.invalidateQueries({
                    queryKey: [QueryKeys.DjingQueue, partyroomId],
                  });
                  scheduleCrewsReconcile();
                },
                onError: () => {
                  client.unsubscribeCurrentRoom(); // 입장 실패한 방의 유령 구독을 남기지 않는다
                  router.push('/parties'); // 에러 발생 시 로비로 이동
                },
              });
            },
            onError: () => {
              // enter 자체가 실패해 입장한 룸이 없다. 레이아웃 언마운트는 더 이상
              // 백엔드 exit을 호출하지 않으므로 별도의 억제 워크어라운드가 필요 없다.
              router.push('/parties'); // 에러 발생 시 로비로 이동
            },
          }
        );
      },
      { once: true }
    );
  };
}

function crewIdToMotionTypeMap(motionInfo?: PartyroomReaction['motion']) {
  if (!motionInfo) {
    return new Map<number, MotionType>();
  }

  return motionInfo.reduce(
    (acc, motion) => {
      motion.crewIds.forEach((crewId) => {
        acc.set(crewId, motion.motionType);
      });
      return acc;
    },
    {} as Map<number, MotionType>
  );
}

/**
 * api 응답으로 온 nullable 필드들이 스토어 내 required로 초기화된 필드들을 덮어 씌우지 않도록 하기 위해 사용합니다
 * 예시로 reaction 필드가 있습니다.
 */
function omitNullables<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== null && value !== undefined)
  ) as T;
}
