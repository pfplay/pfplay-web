export enum PairType {
  BODY = 'BODY',
  FACE = 'FACE',
}

export enum ObtainmentType {
  BASIC = 'BASIC',
  DJ_PNT = 'DJ_PNT', // dj point
  REF_LINK = 'REF_LINK', // referral link
  ROOM_ACT = 'ROOM_ACT', // room activition
}

export enum ActivityType {
  DJ_PNT = 'DJ_PNT',
  REF_LINK = 'REF_LINK',
  ROOM_ACT = 'ROOM_ACT',
}

export enum PlaylistType {
  GRABLIST = 'GRABLIST',
  PLAYLIST = 'PLAYLIST',
}

export enum PlaylistOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum StageType {
  MAIN = 'MAIN',
  GENERAL = 'GENERAL',
}

export enum ReactionType {
  LIKE = 'LIKE',
  DISLIKE = 'DISLIKE',
  GRAB = 'GRAB',
}

export enum QueueStatus {
  CLOSE = 'CLOSE',
  OPEN = 'OPEN',
}

export enum PenaltyType {
  CHAT_BAN_30_SECONDS = 'CHAT_BAN_30_SECONDS', // 채팅 금지
  CHAT_MESSAGE_REMOVAL = 'CHAT_MESSAGE_REMOVAL', // 채팅 메시지 삭제"
  ONE_TIME_EXPULSION = 'ONE_TIME_EXPULSION', // 일회성 강제 퇴장
  PERMANENT_EXPULSION = 'PERMANENT_EXPULSION', // 영구 강제 퇴장
}

export enum MotionType {
  NONE = 'NONE',
  DANCE_TYPE_1 = 'DANCE_TYPE_1', // TODO: 현재 스크립트가 숫자 잡아내지 못해서 수동 수정. 스크립트 수정 필요
  DANCE_TYPE_2 = 'DANCE_TYPE_2',
}

export enum MessageTopic {
  DEACTIVATION = 'DEACTIVATION',
  ACCESS = 'ACCESS',
  AGGREGATION = 'AGGREGATION',
  MOTION = 'MOTION',
  NOTICE = 'NOTICE',
  REGULATION = 'REGULATION',
  PLAYBACK = 'PLAYBACK',
  CHAT = 'CHAT',
}

export enum GradeType {
  HOST = 'HOST',
  COMMUNITY_MANAGER = 'COMMUNITY_MANAGER',
  MODERATOR = 'MODERATOR',
  CLUBBER = 'CLUBBER',
  LISTENER = 'LISTENER',
}

export enum AccessType {
  ENTER = 'ENTER',
  EXIT = 'EXIT',
}

export enum PartyroomPenaltyType {
  DELETE = 'DELETE',
  GGUL = 'GGUL',
  KICK = 'KICK',
  BAN = 'BAN',
}

export enum PartyroomGrade {
  ADMIN = 'ADMIN',
  CM = 'CM',
  MOD = 'MOD',
  CLUBBER = 'CLUBBER',
  LISTENER = 'LISTENER',
}

export enum CrewGrade {
  HOST = 'HOST',
  MANAGER = 'MANAGER',
  MODERATOR = 'MODERATOR',
  CLUBBER = 'CLUBBER',
  LISTENER = 'LISTENER',
}

export enum MessageType {
  CHAT = 'CHAT',
  PROMOTE = 'PROMOTE',
  PENALTY = 'PENALTY',
}

export enum AccessLevel {
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_CREW = 'ROLE_CREW',
  ROLE_GUEST = 'ROLE_GUEST',
}

export enum RedirectionableLocation {
  MAIN = 'MAIN',
  PARTY_ROOM = 'PARTY_ROOM',
}

export enum ProviderType {
  GOOGLE = 'GOOGLE',
}

export enum TokenSubject {
  ACCESS_TOKEN_SUBJECT = 'ACCESS_TOKEN_SUBJECT',
}

export enum TokenClaim {
  UID = 'UID',
  EMAIL = 'EMAIL',
  ACCESS_LEVEL = 'ACCESS_LEVEL',
  AUTHORITY_TIER = 'AUTHORITY_TIER',
}

export enum AuthorityTier {
  FM = 'FM', // Full Crew (지갑인증 - 정회원)
  AM = 'AM', // Associate Crew (지갑인증 x - 준회원)
  GT = 'GT', // Guest
}

export enum RegulationType {
  GRADE = 'GRADE',
  PENALTY = 'PENALTY',
}
