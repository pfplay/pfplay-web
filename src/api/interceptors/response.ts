import { AxiosError, AxiosResponse } from 'axios';
import { getErrorMessage } from '@/api/helper';
import { printErrorLog, printResponseLog } from '@/utils/log';

export function logResponse(response: AxiosResponse) {
  const {
    // config: { url, method },
    config,
    data,
  } = response;

  printResponseLog({
    method: config?.method,
    endPoint: config?.url,
    responseObj: data?.data ?? data,
  });

  return response;
}

export function unwrapResponse(response: AxiosResponse) {
  // TODO: API 응답 명세 확인하고 추가 unwrap 필요한지 검토
  return response.data;
}

export function logError(e: AxiosError) {
  const url = e.config?.url;
  const method = e.config?.method;

  const errorMessage = getErrorMessage(e);

  printErrorLog({
    method,
    endPoint: url,
    errorMessage,
    errorObj: e,
  });

  if (e.status === 401 || e.response?.status === 401) {
    // TODO: 에러 없이 로그인 페이지로 리디렉션
    // return;
  }

  return Promise.reject(e);
}
