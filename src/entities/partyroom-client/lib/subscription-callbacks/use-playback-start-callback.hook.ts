import { PlaybackStartedEvent } from '@/shared/api/websocket/types/partyroom';
import { identify, track } from '@/shared/lib/analytics';
import { useStores } from '@/shared/lib/store/stores.context';

export default function usePlaybackStartCallback() {
  const { useCurrentPartyroom } = useStores();
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
      track('DJ Turn Started', {
        partyroom_id: partyroomId,
        track_id: event.playback.linkId,
      });
      identify({ add: { total_dj_sessions: 1 } });
    }
  };
}
