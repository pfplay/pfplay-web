import { PlaybackDeactivatedEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';
import { appendSummaryToChat } from './emit-playback-summary';

export default function usePlaybackDeactivatedCallback() {
  const { useCurrentPartyroom } = useStores();
  const [
    updatePlaybackActivated,
    updatePlayback,
    updateCurrentDj,
    resetReaction,
    resetCrewsMotion,
  ] = useCurrentPartyroom((state) => [
    state.updatePlaybackActivated,
    state.updatePlayback,
    state.updateCurrentDj,
    state.resetReaction,
    state.resetCrewsMotion,
  ]);

  return (_event: PlaybackDeactivatedEvent) => {
    // 재생 경계 — 구획 방출은 기존 클리어 로직보다 앞 (스펙 §4 배선 순서)
    const { playbackSummaryTracker, appendChatMessage } = useCurrentPartyroom.getState();
    appendSummaryToChat(playbackSummaryTracker.flushBoundary(Date.now()), appendChatMessage);

    updatePlaybackActivated(false);
    updatePlayback(() => undefined);
    updateCurrentDj(undefined);
    resetReaction();
    resetCrewsMotion();
  };
}
