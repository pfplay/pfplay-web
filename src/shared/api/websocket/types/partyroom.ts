import { PartyroomMember } from '@/shared/api/http/types/partyrooms';

// 재생 비활성화 이벤트
export type DeactivationEvent = {
  eventType: PartyroomEventType.DEACTIVATION;
};

// 음악 정보
export type Playback = {
  linkId: string;
  name: string;
  duration: string;
  thumbnailImage: string;
};

// 재생(플레이백) 시작 이벤트
export type PlaybackEvent = {
  eventType: PartyroomEventType.PLAYBACK;
  playback: Playback;
  memberId: number;
};

// 리액션 → 집계 변동 이벤트
export type AggregationEvent = {
  eventType: PartyroomEventType.AGGREGATION;
  aggregation: {
    likeCount: number;
    dislikeCount: number;
    grabCount: number;
  };
};

// 리액션 → 모션 변동 이벤트
export type MotionEvent = {
  eventType: PartyroomEventType.MOTION;
  motionType: MotionType;
  member: {
    memberId: number;
  };
};

// 멤버 출입 이벤트
export type AccessEvent =
  | {
      eventType: PartyroomEventType.ACCESS;
      accessType: AccessType.ENTER;
      member: PartyroomMember;
    }
  | {
      eventType: PartyroomEventType.ACCESS;
      accessType: AccessType.EXIT;
      member: Pick<PartyroomMember, 'memberId'>;
    };

// 공지사항 변동 이벤트
export type NoticeEvent = {
  eventType: PartyroomEventType.NOTICE;
  content: string;
};

// 채팅 메시지 이벤트
export type ChatEvent = {
  eventType: PartyroomEventType.CHAT;
  member: {
    memberId: number;
  };
  message: string;
};

export enum PartyroomEventType {
  DEACTIVATION = 'DEACTIVATION',
  PLAYBACK = 'PLAYBACK',
  AGGREGATION = 'AGGREGATION',
  MOTION = 'MOTION',
  ACCESS = 'ACCESS',
  NOTICE = 'NOTICE',
  CHAT = 'CHAT',
}

enum MotionType {
  NONE = 'NONE',
  MOVE = 'MOVE',
}

enum AccessType {
  ENTER = 'ENTER',
  EXIT = 'EXIT',
}

export type PartyroomSubEvent =
  | DeactivationEvent
  | PlaybackEvent
  | AggregationEvent
  | MotionEvent
  | AccessEvent
  | NoticeEvent
  | ChatEvent;
