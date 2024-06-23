export enum ObtainmentType {
  BASIC = 'BASIC',
  DJ_PNT = 'DJ_PNT',
  REF_LINK = 'REF_LINK',
  ROOM_ACT = 'ROOM_ACT',
}

export enum AuthorityTier {
  FM = 'FM',
  AM = 'AM',
  GT = 'GT',
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

export enum MessageType {
  CHAT = 'CHAT',
  PROMOTE = 'PROMOTE',
  PENALTY = 'PENALTY',
}

export enum MemberGrade {
  HOST = 'HOST',
  MODERATE = 'MODERATE',
  CLUBBER = 'CLUBBER',
}

export enum AccessLevel {
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_MEMBER = 'ROLE_MEMBER',
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

/**
 * @deprecated
 * 제거된 enum. 관련 API 응답 명세가 아직 나오지 않아 남겨둠
 */
export enum PartyroomStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}
