import { AxiosError, AxiosResponse } from 'axios';
import { getErrorMessage } from '@/api/helper';
import { isPureObject } from '@/shared/lib/is-pure-object';
import { printErrorLog, printResponseLog } from '@/shared/lib/log';

export function logResponse(response: AxiosResponse) {
  const { config, data } = response;

  printResponseLog({
    method: config?.method,
    endPoint: config?.url,
    responseObj: data?.data ?? data,
  });

  return response;
}

export function unwrapResponse(response: AxiosResponse) {
  return response.data?.data ?? response.data;
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

  return Promise.reject(e);
}

export function processError(e: AxiosError<unknown>) {
  if (!e.response) {
    return Promise.reject(e);
  }

  if (e.status === 401 || e.response.status === 401) {
    // TODO: 에러 없이 로그인 페이지로 리디렉션, next-auth 토큰 제거
    // return;
  }

  if (isPureObject(e.response.data) && 'data' in e.response.data) {
    e.response.data = e.response.data.data; // unwrap
  }

  return Promise.reject(e);
}
