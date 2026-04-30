import { PlaybackStartedEvent } from '@/shared/api/websocket/types/partyroom';
import { identify, track } from '@/shared/lib/analytics';
import { useStores } from '@/shared/lib/store/stores.context';

export default function usePlaybackStartCallback() {
  const { useCurrentPartyroom } = useStores();
  const [
    partyroomId,
    myCrewId,
    updatePlaybackActivated,
    updatePlayback,
    updateCurrentDj,
    resetReaction,
    updateReaction,
    resetCrewsMotion,
  ] = useCurrentPartyroom((state) => [
    state.id,
    state.me?.crewId,
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

    if (partyroomId) {
      track('Track Playback Started', {
        partyroom_id: partyroomId,
        track_id: event.playback.linkId,
      });

      if (myCrewId !== undefined && event.crewId === myCrewId) {
        track('DJ Turn Started', {
          partyroom_id: partyroomId,
          track_id: event.playback.linkId,
        });
        identify({ add: { total_dj_sessions: 1 } });
      }
    }
  };
}
