import { GradeType } from '@/shared/api/http/types/@enums';
import {
  PartyroomMember,
  PartyroomPlayback,
  PartyroomReaction,
} from '@/shared/api/http/types/partyrooms';
import type { Next } from '@/shared/lib/functions/update';

export type MyPartyroomInfo = {
  memberId: number;
  gradeType: GradeType;
};

export type Model = {
  id?: number;

  me?: MyPartyroomInfo;
  updateMe: (next: Next<MyPartyroomInfo | undefined>) => void;

  playbackActivated: boolean;
  updatePlaybackActivated: (next: boolean | undefined) => void;

  playback?: PartyroomPlayback;
  updatePlayback: (next: Next<PartyroomPlayback | undefined>) => void;

  reaction?: PartyroomReaction;
  updateReaction: (next: Next<PartyroomReaction | undefined>) => void;

  members: PartyroomMember[];
  updateMembers: (next: Next<PartyroomMember[]>) => void;

  init: (
    next: Pick<Model, 'id' | 'me' | 'playbackActivated' | 'playback' | 'reaction' | 'members'>
  ) => void;
  reset: () => void;
};
