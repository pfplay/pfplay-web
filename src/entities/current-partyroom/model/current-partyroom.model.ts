import { PartyroomPlayback, PartyroomReaction } from '@/shared/api/http/types/partyrooms';
import type { Next } from '@/shared/lib/functions/update';

export type CurrentPartyroom = {
  id?: number;

  isPlaybackActivated: boolean;
  updatePlaybackActivated: (next: boolean | undefined) => void;

  playback?: PartyroomPlayback;
  updatePlayback: (next: Next<PartyroomPlayback | undefined>) => void;

  reaction?: PartyroomReaction;
  updateReaction: (next: Next<PartyroomReaction | undefined>) => void;

  init: (
    next: Pick<CurrentPartyroom, 'id' | 'isPlaybackActivated' | 'playback' | 'reaction'>
  ) => void;
  reset: () => void;
};
