export enum Authority {
  ROLE_USER = 'ROLE_USER',
  ROLE_GUEST = 'ROLE_GUEST',
  ROLE_WALLET_USER = 'ROLE_WALLET_USER',
}

export enum AvatarType {
  // TODO: 백엔드에 enum 이 없어 하드 코딩으로 생성한 enum. 백엔드 측에 이게 왜 enum 이 아닌지 문의 필요
  Basic = 'basic',
  Dj = 'dj',
  Ref = 'ref',
  Room = 'room',
}
