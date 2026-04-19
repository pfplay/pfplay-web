import {
  AvatarCompositionType,
  GradeType,
  MotionType,
  PenaltyType,
  ReactionType,
} from '../../http/types/@enums';

// ──────────────────────────────────────────────
// 공통 타입
// ──────────────────────────────────────────────

/** 모든 서버→클라이언트 브로드캐스트 메시지의 공통 필드 */
type WebSocketEventBase = {
  partyroomId: number;
  id: string; // UUID v4 — 멱등성 처리용
  timestamp: number; // Unix epoch ms
};

/** 아바타 중첩 구조 (crew_entered, crew_profile_changed 등에서 사용) */
export type CrewAvatar = {
  avatarCompositionType: AvatarCompositionType;
  avatarBodyUri: string;
  avatarFaceUri: string | null;
  avatarIconUri: string;
  combinePositionX: number;
  combinePositionY: number;
  offsetX: number;
  offsetY: number;
  scale: number;
};

// ──────────────────────────────────────────────
// 이벤트 enum
// ──────────────────────────────────────────────

export enum PartyroomEventType {
  PARTYROOM_CLOSED = 'PARTYROOM_CLOSED',
  PLAYBACK_DEACTIVATED = 'PLAYBACK_DEACTIVATED',
  CREW_ENTERED = 'CREW_ENTERED',
  CREW_EXITED = 'CREW_EXITED',
  PARTYROOM_NOTICE_UPDATED = 'PARTYROOM_NOTICE_UPDATED',
  REACTION_AGGREGATION_UPDATED = 'REACTION_AGGREGATION_UPDATED',
  REACTION_PERFORMED = 'REACTION_PERFORMED',
  PLAYBACK_STARTED = 'PLAYBACK_STARTED',
  CHAT_MESSAGE_SENT = 'CHAT_MESSAGE_SENT',
  CREW_GRADE_CHANGED = 'CREW_GRADE_CHANGED',
  CREW_PENALIZED = 'CREW_PENALIZED',
  CREW_PROFILE_CHANGED = 'CREW_PROFILE_CHANGED',
  DJ_QUEUE_CHANGED = 'DJ_QUEUE_CHANGED',
}

// ──────────────────────────────────────────────
// 이벤트 타입 정의
// ──────────────────────────────────────────────

/** 파티룸 폐쇄 이벤트 */
export type PartyroomClosedEvent = WebSocketEventBase & {
  eventType: PartyroomEventType.PARTYROOM_CLOSED;
};

/** 재생 비활성화 이벤트 */
export type PlaybackDeactivatedEvent = WebSocketEventBase & {
  eventType: PartyroomEventType.PLAYBACK_DEACTIVATED;
};

/** 크루 입장 이벤트 */
export type CrewEnteredEvent = WebSocketEventBase & {
  eventType: PartyroomEventType.CREW_ENTERED;
  crew: {
    crewId: number;
    gradeType: GradeType;
    nickname: string;
    avatar: CrewAvatar;
    countryCode?: string | null;
  };
};

/** 크루 퇴장 이벤트 */
export type CrewExitedEvent = WebSocketEventBase & {
  eventType: PartyroomEventType.CREW_EXITED;
  crewId: number;
};

/** 공지사항 변동 이벤트 */
export type PartyroomNoticeUpdatedEvent = WebSocketEventBase & {
  eventType: PartyroomEventType.PARTYROOM_NOTICE_UPDATED;
  content: string;
};

/** 리액션 집계 변동 이벤트 */
export type ReactionAggregationUpdatedEvent = WebSocketEventBase & {
  eventType: PartyroomEventType.REACTION_AGGREGATION_UPDATED;
  aggregation: {
    likeCount: number;
    dislikeCount: number;
    grabCount: number;
  };
};

/** 리액션 모션 이벤트 */
export type ReactionPerformedEvent = WebSocketEventBase & {
  eventType: PartyroomEventType.REACTION_PERFORMED;
  motionType: MotionType;
  reactionType: ReactionType;
  crew: {
    crewId: number;
  };
};

/** 음악 정보 (reaction count 제거됨 — 클라이언트에서 초기값 0으로 설정) */
export type Playback = {
  linkId: string;
  name: string;
  duration: string;
  thumbnailImage: string;
};

/** 재생 시작 이벤트 */
export type PlaybackStartedEvent = WebSocketEventBase & {
  eventType: PartyroomEventType.PLAYBACK_STARTED;
  playback: Playback;
  crewId: number;
};

/** 채팅 메시지 이벤트 */
export type ChatMessageSentEvent = WebSocketEventBase & {
  eventType: PartyroomEventType.CHAT_MESSAGE_SENT;
  crew: {
    crewId: number;
  };
  message: {
    messageId: string;
    content: string;
  };
};

/** 크루 등급 조정 이벤트 */
export type CrewGradeChangedEvent = WebSocketEventBase & {
  eventType: PartyroomEventType.CREW_GRADE_CHANGED;
  adjuster: {
    crewId: number;
  };
  adjusted: {
    crewId: number;
    prevGradeType: GradeType;
    currGradeType: GradeType;
  };
};

/** 크루 페널티 부과 이벤트 */
export type CrewPenalizedEvent = WebSocketEventBase & {
  eventType: PartyroomEventType.CREW_PENALIZED;
  penaltyType: PenaltyType;
  detail: string;
  punisher: {
    crewId: number;
  };
  punished: {
    crewId: number;
  };
};

/** 크루 프로필 변경 이벤트 (아바타 필드 중첩) */
export type CrewProfileChangedEvent = WebSocketEventBase & {
  eventType: PartyroomEventType.CREW_PROFILE_CHANGED;
  crewId: number;
  nickname: string;
  avatar: CrewAvatar;
};

/** DJ 큐 변경 이벤트 */
export type DjQueueChangedEvent = WebSocketEventBase & {
  eventType: PartyroomEventType.DJ_QUEUE_CHANGED;
  djs: Array<{
    crewId: number;
    orderNumber: number;
    nickname: string;
    avatarIconUri: string;
  }>;
};

// ──────────────────────────────────────────────
// 이벤트 유니온
// ──────────────────────────────────────────────

export type PartyroomSubEvent =
  | PartyroomClosedEvent
  | PlaybackDeactivatedEvent
  | CrewEnteredEvent
  | CrewExitedEvent
  | PartyroomNoticeUpdatedEvent
  | ReactionAggregationUpdatedEvent
  | ReactionPerformedEvent
  | PlaybackStartedEvent
  | ChatMessageSentEvent
  | CrewGradeChangedEvent
  | CrewPenalizedEvent
  | CrewProfileChangedEvent
  | DjQueueChangedEvent;
