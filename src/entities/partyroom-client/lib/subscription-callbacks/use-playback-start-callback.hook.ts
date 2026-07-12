import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { PlaybackStartedEvent } from '@/shared/api/websocket/types/partyroom';
import { identify, track } from '@/shared/lib/analytics';
import { useStores } from '@/shared/lib/store/stores.context';
import { appendSummaryToChat } from './emit-playback-summary';

export default function usePlaybackStartCallback() {
  const { useCurrentPartyroom } = useStores();
  const queryClient = useQueryClient();
  const [
    updatePlaybackActivated,
    updatePlayback,
    updateCurrentDj,
    resetReaction,
    updateReaction,
    resetCrewsMotion,
  ] = useCurrentPartyroom((state) => [
    state.updatePlaybackActivated,
    state.updatePlayback,
    state.updateCurrentDj,
    state.resetReaction,
    state.updateReaction,
    state.resetCrewsMotion,
  ]);

  return (event: PlaybackStartedEvent) => {
    // 구획 방출(이전 곡)+시드(새 곡) — 기존 스토어 갱신(리셋 포함)보다 반드시 앞 (스펙 §4 배선 순서).
    // getState()로 이벤트 시점 스냅샷을 읽는다(아래 analytics의 stale closure 방지 선례와 동일).
    const { playbackSummaryTracker, appendChatMessage, crews } = useCurrentPartyroom.getState();
    const djNickname = crews.find((crew) => crew.crewId === event.crewId)?.nickname ?? null; // L6 폴백은 렌더에서
    appendSummaryToChat(
      playbackSummaryTracker.seedFromStart({
        eventId: event.id,
        trackName: event.playback.name,
        trackIdentity: event.playback.linkId,
        djNickname,
        durationText: event.playback.duration,
        now: Date.now(),
      }),
      appendChatMessage
    );

    updatePlaybackActivated(true);
    updatePlayback(event.playback);
    updateCurrentDj({ crewId: event.crewId });
    resetReaction();
    updateReaction((prev) => ({
      ...prev,
      aggregation: {
        likeCount: 0,
        dislikeCount: 0,
        grabCount: 0,
      },
    }));
    resetCrewsMotion();

    // Read latest store state at event time. The subscription is registered
    // before initPartyroom() populates `id`/`me`, so closure-captured values
    // would be stale; getState() always returns the current snapshot.
    const { id: partyroomId, me } = useCurrentPartyroom.getState();
    if (!partyroomId) return;

    track('Track Playback Started', {
      partyroom_id: partyroomId,
      track_id: event.playback.linkId,
    });

    if (me?.crewId !== undefined && event.crewId === me.crewId) {
      // 내 턴이 시작되면 재생 커서가 전진하므로, 내 트랙 목록을 무효화해
      // NOW/NEXT 배지가 새 커서로 갱신되게 한다. (열려있지 않은 쿼리는 stale 표시만)
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PlaylistTracks] });

      track('DJ Turn Started', {
        partyroom_id: partyroomId,
        track_id: event.playback.linkId,
      });
      identify({ add: { total_dj_sessions: 1 } });
    }
  };
}
