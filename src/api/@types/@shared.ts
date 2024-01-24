export interface Empty {}

export type FetchStatus = 'idle' | 'loading' | 'succeeded' | 'failed';
export type ErrorCode = 'BR001' | 'BR002';
export type ErrorResponse = {
  data: {
    code: number;
    errorCode: ErrorCode;
    message: string;
    status: string;
  };
};
