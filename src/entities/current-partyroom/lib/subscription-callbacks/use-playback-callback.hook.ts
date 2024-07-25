import { useCallback } from 'react';
import { PlaybackEvent } from '@/shared/api/websocket/types/partyroom';

export default function usePlaybackCallback() {
  return useCallback((event: PlaybackEvent) => {
    console.log('PlaybackEvent:', event);
  }, []);
}
