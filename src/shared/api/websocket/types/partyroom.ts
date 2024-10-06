import { PartyroomCrew } from '@/shared/api/http/types/partyrooms';
import { AccessType, GradeType, MotionType, PenaltyType } from '../../http/types/@enums';

// 재생 비활성화 이벤트
export type PartyroomDeactivationEvent = {
  eventType: PartyroomEventType.PARTYROOM_DEACTIVATION;
};

// 멤버 출입 이벤트
export type PartyroomAccessEvent =
  | {
      eventType: PartyroomEventType.PARTYROOM_ACCESS;
      accessType: AccessType.ENTER;
      crew: PartyroomCrew;
    }
  | {
      eventType: PartyroomEventType.PARTYROOM_ACCESS;
      accessType: AccessType.EXIT;
      crew: Pick<PartyroomCrew, 'crewId'>;
    };

// 공지사항 변동 이벤트
export type PartyroomNoticeEvent = {
  eventType: PartyroomEventType.PARTYROOM_NOTICE;
  content: string;
};

// 리액션 → 집계 변동 이벤트
export type ReactionAggregationEvent = {
  eventType: PartyroomEventType.REACTION_AGGREGATION;
  aggregation: {
    likeCount: number;
    dislikeCount: number;
    grabCount: number;
  };
};

// 리액션 → 모션 변동 이벤트
export type ReactionMotionEvent = {
  eventType: PartyroomEventType.REACTION_MOTION;
  motionType: MotionType;
  crew: {
    crewId: number;
  };
};

// 음악 정보
export type Playback = {
  linkId: string;
  name: string;
  duration: string;
  thumbnailImage: string;
};

// 재생(플레이백) 시작 이벤트
export type PlaybackStartEvent = {
  eventType: PartyroomEventType.PLAYBACK_START;
  playback: Playback;
  crewId: number;
};

export type PlaybackSkipEvent = {
  eventType: PartyroomEventType.PLAYBACK_SKIP;
  // TODO: 임의로 작성. 실제 타입 확인 필요
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

// 크루 등급 조정 이벤트
export type CrewGradeEvent = {
  eventType: PartyroomEventType.CREW_GRADE;
  adjuster: {
    crewId: number;
  };
  adjusted: {
    crewId: number;
    prevGradeType: GradeType;
    currGradeType: GradeType;
  };
};

// 크루 페널티 부과 이벤트
export type CrewPenaltyEvent = {
  eventType: PartyroomEventType.CREW_PENALTY;
  penaltyType: PenaltyType;
  reason: string;
  punisher: {
    crewId: number;
  };
  punished: {
    crewId: number;
  };
};

// 크루 프로필(닉네임/아바타) 변경 이벤트
export type CrewProfileEvent = {
  eventType: PartyroomEventType.CREW_PROFILE;
} & Pick<
  PartyroomCrew,
  | 'crewId'
  | 'nickname'
  | 'avatarFaceUri'
  | 'avatarBodyUri'
  | 'avatarIconUri'
  | 'combinePositionX'
  | 'combinePositionY'
>;

export enum PartyroomEventType {
  PARTYROOM_DEACTIVATION = 'PARTYROOM_DEACTIVATION',
  PARTYROOM_ACCESS = 'PARTYROOM_ACCESS',
  PARTYROOM_NOTICE = 'PARTYROOM_NOTICE',
  REACTION_AGGREGATION = 'REACTION_AGGREGATION',
  REACTION_MOTION = 'REACTION_MOTION',
  PLAYBACK_START = 'PLAYBACK_START',
  PLAYBACK_SKIP = 'PLAYBACK_SKIP',
  CHAT = 'CHAT',
  CREW_GRADE = 'CREW_GRADE',
  CREW_PENALTY = 'CREW_PENALTY',
  CREW_PROFILE = 'CREW_PROFILE',
}

export type PartyroomSubEvent =
  | PartyroomDeactivationEvent
  | PartyroomAccessEvent
  | PartyroomNoticeEvent
  | ReactionAggregationEvent
  | ReactionMotionEvent
  | PlaybackStartEvent
  | PlaybackSkipEvent
  | ChatEvent
  | CrewGradeEvent
  | CrewPenaltyEvent
  | CrewProfileEvent;
