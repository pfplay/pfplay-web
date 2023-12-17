export type FetchStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface PageRequest {
  page: number;
  size: number;
}
export interface Pagination {
  pageSize: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}
export interface PageResponse<T> {
  content: T[];
  pagination: Pagination;
}
