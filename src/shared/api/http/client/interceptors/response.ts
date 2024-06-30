import { AxiosError, AxiosResponse } from 'axios';
import { getErrorMessage } from '@/shared/api/get-error-message';
import { isPureObject } from '@/shared/lib/functions/is-pure-object';
import { printErrorLog, printResponseLog } from '@/shared/lib/functions/log/network-log';
import withDebugger from '@/shared/lib/functions/log/with-debugger';

const logger = withDebugger(0);
const verboseLogger = withDebugger(1);

const responseLog = verboseLogger(printResponseLog);
const errorLog = logger(printErrorLog);

export function logResponse(response: AxiosResponse) {
  const { config, data } = response;

  responseLog({
    method: config?.method,
    endPoint: config?.url,
    response: data?.data ?? data,
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

  errorLog({
    method,
    endPoint: url,
    errorMessage,
    error: e,
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
