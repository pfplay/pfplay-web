import { GradeType } from '@/shared/api/http/types/@enums';
import { PartyroomPlayback, PartyroomReaction } from '@/shared/api/http/types/partyrooms';
import type { Next } from '@/shared/lib/functions/update';

export type MyPartyroomInfo = {
  memberId: number;
  gradeType: GradeType;
  host: boolean;
};

export type CurrentPartyroom = {
  id?: number;

  me?: MyPartyroomInfo;
  updateMe: (next: Next<MyPartyroomInfo | undefined>) => void;

  playbackActivated: boolean;
  updatePlaybackActivated: (next: boolean | undefined) => void;

  playback?: PartyroomPlayback;
  updatePlayback: (next: Next<PartyroomPlayback | undefined>) => void;

  reaction?: PartyroomReaction;
  updateReaction: (next: Next<PartyroomReaction | undefined>) => void;

  init: (
    next: Pick<CurrentPartyroom, 'id' | 'me' | 'playbackActivated' | 'playback' | 'reaction'>
  ) => void;
  reset: () => void;
};
