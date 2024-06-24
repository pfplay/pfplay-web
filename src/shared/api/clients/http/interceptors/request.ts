import { InternalAxiosRequestConfig } from 'axios';
import { printRequestLog } from '@/shared/lib/functions/log';

export function logRequest(config: InternalAxiosRequestConfig) {
  printRequestLog({
    method: config.method,
    endPoint: config.url,
    requestParams: config.params,
    requestData: config.data,
    config,
  });

  return config;
}
