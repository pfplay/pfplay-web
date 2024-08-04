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
  updatePlaybackActivated: (next: boolean) => void;

  playback?: PartyroomPlayback;
  updatePlayback: (next: Next<PartyroomPlayback | undefined>) => void;

  reaction?: PartyroomReaction;
  updateReaction: (next: Next<PartyroomReaction | undefined>) => void;

  members: PartyroomMember[];
  updateMembers: (next: Next<PartyroomMember[]>) => void;

  notice: string;
  updateNotice: (next: string) => void;

  init: (
    next: Pick<
      Model,
      'id' | 'me' | 'playbackActivated' | 'playback' | 'reaction' | 'members' | 'notice'
    >
  ) => void;
  reset: () => void;
};
