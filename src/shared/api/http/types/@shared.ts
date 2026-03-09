// TODO: generate from BE enum
export enum ErrorCode {
  // JwtAuthenticationException
  ACCESS_TOKEN_NOT_FOUND = 'JWT-001', // ACCESS_TOKEN 을 찾을 수 없음
  ACCESS_TOKEN_INVALID = 'JWT-002', // ACCESS_TOKEN 이 유효하지 않음
  ACCESS_TOKEN_EXPIRED = 'JWT-003', // ACCESS_TOKEN 이 만료됨

  // SessionException
  UNAUTHORIZED_SESSION = 'SESS-001', // 허가되지 않은 세션 요청

  // BlockException
  BLOCK_HISTORY_NOT_FOUND = 'BLK-001', // 차단 기록을 찾을 수 없음
  ALREADY_BLOCKED_CREW = 'BLK-002', // 이미 차단된 크루

  // CrewException
  NOT_FOUND_ACTIVE_ROOM = 'CRW-001', // 내 활성화된 방을 찾을 수 없음
  INVALID_ACTIVE_ROOM = 'CRW-002', // 내 활성화된 방이 유효하지 않음

  // UserAvatarException
  AVATAR_SELECTION_FORBIDDEN = 'AVT-001', // 제한 사항(e.g. DJ 포인트 부족)으로 아바타 선택이 불가능함 - FIXME: 수정 필요한지 확인 - https://pfplay.slack.com/archives/C051N8A0ZSB/p1737211081003499

  // DjException
  ALREADY_REGISTERED = 'DJ-001', // 이미 DJ로 등록됨
  QUEUE_CLOSED = 'DJ-002', // DJ 대기열이 닫혀 있음
  EMPTY_PLAYLIST = 'DJ-003', // 비어있는 재생목록은 등록할 수 없음
  DJ_NOT_FOUND = 'DJ-004', // DJ 대기열에서 해당 DJ를 찾을 수 없음

  // GradeException
  MANAGER_GRADE_REQUIRED = 'GRD-001', // 이 작업을 수행하려면 관리자 등급이 필요함
  UNABLE_TO_SET_HOST = 'GRD-002', // 호스트로 설정할 수 없음
  GRADE_INSUFFICIENT_FOR_OPERATION = 'GRD-003', // 현재 등급으로는 요청한 작업을 수행하기에 부족함
  GRADE_EXCEEDS_ALLOWED_THRESHOLD = 'GRD-004', // 지정된 등급이 허용된 임계값을 초과함
  GUEST_ONLY_POSSIBLE_LISTENER = 'GRD-005', // 게스트는 청취자 역할만 가능함

  // PartyroomException
  NOT_FOUND_ROOM = 'PTR-001', // 파티룸을 찾을 수 없음
  ALREADY_TERMINATED = 'PTR-002', // 이미 종료된 파티룸
  EXCEEDED_LIMIT = 'PTR-003', // 파티룸 정원 초과
  ACTIVE_ANOTHER_ROOM = 'PTR-004', // 이미 다른 파티룸에 활성화되어 있음
  RESTRICTED_AUTHORITY = 'PTR-005', // 권한이 제한됨 (e.g. 지갑 인증 유저만 파티룸 생성 가능)
  ALREADY_HOST = 'PTR-006', // 이미 다른 파티룸의 호스트임

  // PenaltyException
  PERMANENT_EXPULSION = 'PNT-001', // 영구적으로 추방된 사용자
  PENALTY_HISTORY_NOT_FOUND = 'PNT-002', // 제거 등을 위한 패널티 기록을 찾을 수 없음

  // PlaylistException
  NO_WALLET = 'PLL-001', // 지갑이 없음
  EXCEEDED_PLAYLIST_LIMIT = 'PLL-002', // 재생목록 개수 제한을 초과함
  NOT_FOUND_PLAYLIST = 'PLL-003', // 재생목록을 찾을 수 없음

  // PlaylistTrackException
  DUPLICATE_TRACK_IN_PLAYLIST = 'TRK-001', // 재생목록에 이미 존재하는 음악은 추가할 수 없음
  EXCEEDED_TRACK_LIMIT = 'TRK-002', // 재생목록에 추가할 수 있는 음악 개수를 초과함
  NOT_FOUND_TRACK = 'TRL-003', // 음악을 찾을 수 없음
  INVALID_TRACK_ORDER = 'TRK-004', // 재생목록에 추가할 수 없는 음악 순서
}

export type APIError = {
  status: string; // ex) "UNAUTHORIZED", "NOT_FOUND"
  code: number; // ex) 401, 404
  message: string; // ex) "인증이 올바르지 않습니다."
  errorCode: ErrorCode; // ex) "BR001", "BR002"
};

export type PaginationPayload = {
  pageNumber: number;
  pageSize: number;
};

type Pagination = {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
};
export type PaginationResponse<T> = {
  content: T[];
  pagination: Pagination;
};

export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';
