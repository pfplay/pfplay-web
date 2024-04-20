export interface Empty {}

export type FetchStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

// TODO: generate from BE enum
export enum ErrorCode {
  REQUIRED_WALLET_CONNECT = 'BR001',
  PLAYLIST_MAXIMUM_COUNT_EXCEED = 'BR002',
}

export type APIError = {
  status: string; // ex) "UNAUTHORIZED", "NOT_FOUND"
  code: number; // ex) 401, 404
  message: string; // ex) "인증이 올바르지 않습니다."
  errorCode: ErrorCode; // ex) "BR001", "BR002"
};

export type PaginationPayload = {
  page: number;
  size: number;
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
