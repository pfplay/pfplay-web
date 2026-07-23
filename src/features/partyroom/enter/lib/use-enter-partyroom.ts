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
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useAppRouter } from '@/shared/lib/router/use-app-router.hook';
import { useStores } from '@/shared/lib/store/stores.context';
import { useDialog } from '@/shared/ui/components/dialog';
import { useEnterPartyroom as useEnterPartyroomMutation } from '../api/use-enter-partyroom.mutation';

type Options = {
  entrySource?: EntrySource;
};

export function useEnterPartyroom(partyroomId: number, options: Options = {}) {
  const client = usePartyroomClient();
  const handleEvent = useHandlePartyroomSubscriptionEvent();
  const { useCurrentPartyroom } = useStores();
  const initPartyroom = useCurrentPartyroom((state) => state.init);
  const { mutate: enter } = useEnterPartyroomMutation();
  const queryClient = useQueryClient();
  const router = useAppRouter();
  const { openConfirmDialog } = useDialog();
  const t = useI18n();

  const entrySource: EntrySource = options.entrySource ?? 'direct';

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
          // #477 재연결 resync 는 기억하던 방을 tryEnter 로 재주장하지 않는다 —
          // 멀티 디바이스 승계(new-session-wins)에서 밀려난 브라우저가 재연결 순간 새 기기의 방을
          // 역으로 밀어내는 세션 되훔침(핑퐁)의 발원지였다. 대신 서버 권위 스냅샷("내 활성 방")을
          // 조회하고 그 결과로만 분기한다(level-triggered, 재연결=이벤트 재생 아닌 스냅샷 재취득).
          silent(partyroomsService.getMyActiveRoom(), {
            onSuccess: (snapshot) => {
              if (snapshot && snapshot.partyroomId === partyroomId) {
                // 활성 방 == 현재 화면의 방 → 멤버십 유지. 경량 resync
                // (구독은 handleConnect 가 subscriptions[] 기준으로 이미 재구독 복원).
                queryClient.invalidateQueries({ queryKey: [QueryKeys.DjingQueue, partyroomId] });
              } else {
                // 활성 방 != 현재 방(밀려남) 또는 활성 방 없음 → 로컬 teardown 후 이탈.
                // 서버가 밀어냄을 이미 완결(명시 EXIT)했으므로 exit API 를 호출하지 않는다.
                client.unsubscribeCurrentRoom();
                router.push('/parties');
              }
            },
            onError: () => router.push('/parties'),
          });
        });

        const proceedEnter = () => {
          enter(
            { partyroomId },
            {
              onSuccess: (enterResponse) => {
                // #476 이 탭이 입장 성공한 방 기록 — 이후 다른 세션 판별(사전 컨펌)에 쓰인다.
                client.markEnteredRoom(partyroomId);
                silent(setup(enterResponse), {
                  onSuccess: () => {
                    client.subscribe(partyroomId, handleEvent);
                    queryClient.invalidateQueries({
                      queryKey: [QueryKeys.DjingQueue, partyroomId],
                    });
                  },
                  onError: () => {
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
        };

        // #476 사전 컨펌 — 다른 세션(탭/기기)이 활성 방을 점유 중인데 다른 방으로 입장하려 하면
        // 확인을 받는다(데스크탑 DJ 세션을 모바일 오조작으로 잃는 사고 방지). check-then-act 레이스는
        // 허용 — 정합성은 V38 유니크가 보장하는 순수 advisory. 서버 활성 방이 이 탭이 들어갔던
        // 방(myEnteredRoomId)이면 같은 세션의 방 전환이므로 컨펌하지 않는다. 이 탭이 같은 방을
        // 재입장(myEnteredRoomId===partyroomId)하는 경우 조회 자체를 생략한다.
        if (client.myEnteredRoomId === partyroomId) {
          proceedEnter();
          return;
        }
        silent(partyroomsService.getMyActiveRoom(), {
          onSuccess: (snapshot) => {
            const isOtherSessionActive =
              snapshot != null &&
              snapshot.partyroomId !== partyroomId &&
              snapshot.partyroomId !== client.myEnteredRoomId;
            if (!isOtherSessionActive) {
              proceedEnter();
              return;
            }
            silent(openConfirmDialog({ content: t.party.para.supersede_confirm }), {
              onSuccess: (confirmed) => {
                if (confirmed) {
                  proceedEnter();
                } else {
                  router.push('/parties'); // 취소 → 입장하지 않고 로비로
                }
              },
              onError: () => proceedEnter(),
            });
          },
          // 스냅샷 조회 실패 시 컨펌 없이 입장(advisory, fail-open — 정합성은 서버가 보장).
          onError: () => proceedEnter(),
        });
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
