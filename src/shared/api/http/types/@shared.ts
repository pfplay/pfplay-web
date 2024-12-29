// TODO: generate from BE enum
export enum ErrorCode {
  REQUIRED_WALLET_CONNECT = 'BR001', // FIXME: BE 측에서 에러 코드 복구되면 수정 - https://pfplay.slack.com/archives/C051N8A0ZSB/p1735470840734989
  PLAYLIST_MAXIMUM_COUNT_EXCEED = 'BR002', // FIXME: BE 측에서 에러 코드 복구되면 수정 - https://pfplay.slack.com/archives/C051N8A0ZSB/p1735470840734989

  // SessionException
  UNAUTHORIZED_SESSION = 'SESS-001', // 허가되지 않은 세션 요청

  // CrewException
  NOT_FOUND_ACTIVE_ROOM = 'CRW-001', // 내 활성화된 방을 찾을 수 없음
  INVALID_ACTIVE_ROOM = 'CRW-002', // 내 활성화된 방이 유효하지 않음

  // DjException
  ALREADY_REGISTERED = 'DJ-001', // 이미 DJ로 등록됨
  QUEUE_CLOSED = 'DJ-002', // DJ 대기열이 닫혀 있음
  EMPTY_PLAYLIST = 'DJ-003', // 비어있는 재생목록은 등록할 수 없음

  // GradeException
  MANAGER_GRADE_REQUIRED = 'GRD-001', // 이 작업을 수행하려면 관리자 등급이 필요함
  UNABLE_TO_SET_HOST = 'GRD-002', // 호스트로 설정할 수 없음
  GRADE_INSUFFICIENT_FOR_OPERATION = 'GRD-003', // 현재 등급으로는 요청한 작업을 수행하기에 부족함
  GRADE_EXCEEDS_ALLOWED_THRESHOLD = 'GRD-004', // 지정된 등급이 허용된 임계값을 초과함
  GUEST_ONLY_POSSIBLE_LISTENER = 'GRD-005', // 게스트는 청취자 역할만 가능함

  // PartyroomException
  NOT_FOUND_ROOM = 'PTR-001', // 파티룸을 찾을 수 없음
  ALREADY_TERMINATED = 'PTR-002', // 이미 종료된 파티룸
  EXCEEDED_LIMIT = 'PTR-003', // 입장 제한을 초과함
  ACTIVE_ANOTHER_ROOM = 'PTR-004', // 이미 다른 파티룸에 활성화되어 있음
  CACHE_MISS_SESSION = 'PTR-005', // 세션 ID에 대한 캐시 데이터가 없음
  RESTRICTED_AUTHORITY = 'PTR-006', // 권한이 제한됨
  ALREADY_HOST = 'PTR-007', // 이미 다른 파티룸의 호스트임

  // PenaltyException
  PERMANENT_EXPULSION = 'PNT-001', // 영구적으로 추방된 사용자

  // PlaylistMusicException
  DUPLICATE_MUSIC_IN_PLAYLIST = 'PLM-001', // 재생목록에 이미 존재하는 음악은 추가할 수 없음
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
