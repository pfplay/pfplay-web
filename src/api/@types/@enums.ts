export enum ApiHeader {
  AUTHORIZATION = 'AUTHORIZATION',
  BEARER = 'BEARER',
}

export enum Authority {
  ROLE_USER = 'ROLE_USER',
  ROLE_GUEST = 'ROLE_GUEST',
  ROLE_WALLET_USER = 'ROLE_WALLET_USER',
}

export enum Domain {
  CLIENT = 'CLIENT',
}

export enum PartyPermissionRole {
  ADMIN = 'ADMIN',
  COMMUNITY_MANAGER = 'COMMUNITY_MANAGER',
  MODERATOR = 'MODERATOR',
  CLUBBER = 'CLUBBER',
}

export enum PartyRoomStatus {
  ACTIVE = 'ACTIVE',
}

export enum PartyRoomType {
  PARTY = 'PARTY',
  MAIN = 'MAIN',
}
