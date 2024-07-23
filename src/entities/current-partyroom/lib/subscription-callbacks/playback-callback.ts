import { PlaybackEvent } from '@/shared/api/websocket/types/partyroom';

export default function playbackCallback(event: PlaybackEvent) {
  console.log('playbackCallback', event);
}
