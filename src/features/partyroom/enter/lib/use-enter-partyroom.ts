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

  const entrySource: EntrySource = options.entrySource ?? 'direct';
  // 재연결 resync 의 첫 연결 skip 가드 (연결 간 보존). 첫 연결은 아래 once enter 가 담당. (#402)
  const firstConnect = useRef(true);

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
        enter(
          { partyroomId },
          {
            onSuccess: (enterResponse) => {
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
      },
      { once: true }
    );

    // 재연결 resync (비-once). 첫 연결은 firstConnect ref 로 skip(이중 tryEnter 방지). (#402)
    client.onConnect(() => {
      if (firstConnect.current) {
        firstConnect.current = false;
        return;
      }
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
              silent(setup(enterResponse), {
                onSuccess: invalidateDjQueue,
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
