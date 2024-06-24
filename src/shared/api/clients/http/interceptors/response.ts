import { AxiosError, AxiosResponse } from 'axios';
import { getErrorMessage } from '@/shared/api/get-error-message';
import { isPureObject } from '@/shared/lib/functions/is-pure-object';
import { printErrorLog, printResponseLog } from '@/shared/lib/functions/log';

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

  if (isPureObject(e.response.data) && 'data' in e.response.data) {
    e.response.data = e.response.data.data; // unwrap
  }

  return Promise.reject(e);
}
