import { PartyroomCrew } from '@/shared/api/http/types/partyrooms';
import { AccessType, GradeType, MotionType, RegulationType } from '../../http/types/@enums';

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
  crewId: number;
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
  crew: {
    crewId: number;
  };
};

// 멤버 출입 이벤트
export type AccessEvent =
  | {
      eventType: PartyroomEventType.ACCESS;
      accessType: AccessType.ENTER;
      crew: PartyroomCrew;
    }
  | {
      eventType: PartyroomEventType.ACCESS;
      accessType: AccessType.EXIT;
      crew: Pick<PartyroomCrew, 'crewId'>;
    };

// 공지사항 변동 이벤트
export type NoticeEvent = {
  eventType: PartyroomEventType.NOTICE;
  content: string;
};

// 채팅 메시지 이벤트
export type ChatEvent = {
  eventType: PartyroomEventType.CHAT;
  partyroomId: {
    id: number;
  };
  crew: {
    crewId: number;
  };
  message: string;
};

// 멤버 권한 변동 이벤트
export type RegulationEvent = {
  eventType: PartyroomEventType.REGULATION;
  regulationType: RegulationType.GRADE;
  crew: {
    crewId: number;
    prevGradeType: GradeType;
    currGradeType: GradeType;
  };
};

export enum PartyroomEventType {
  DEACTIVATION = 'DEACTIVATION',
  PLAYBACK = 'PLAYBACK',
  AGGREGATION = 'AGGREGATION',
  MOTION = 'MOTION',
  ACCESS = 'ACCESS',
  NOTICE = 'NOTICE',
  CHAT = 'CHAT',
  REGULATION = 'REGULATION',
}

export type PartyroomSubEvent =
  | DeactivationEvent
  | PlaybackEvent
  | AggregationEvent
  | MotionEvent
  | AccessEvent
  | NoticeEvent
  | ChatEvent
  | RegulationEvent;
