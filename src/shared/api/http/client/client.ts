import axios, { AxiosInstance } from 'axios';
import { flow } from '@/shared/lib/functions/flow';
import { logRequest } from './interceptors/request';
import {
  emitError,
  logError,
  logResponse,
  redirectOnServiceUnavailable,
  unwrapError,
  unwrapResponse,
} from './interceptors/response';

// Preview/CI 콜드 스타트(러너→Vercel→백엔드 cross-region) 대응을 위해 환경변수로 override 가능.
// 미설정 시 production 디폴트 4s 유지.
const HTTP_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_HTTP_TIMEOUT_MS) || 4000;

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_HOST_NAME,
  timeout: HTTP_TIMEOUT_MS,
  validateStatus: (status) => status >= 200 && status < 400,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(flow([logRequest]));
axiosInstance.interceptors.response.use(
  flow([logResponse, unwrapResponse]),
  flow([logError, redirectOnServiceUnavailable, unwrapError, emitError])
);

export default abstract class HTTPClient {
  protected readonly axiosInstance = axiosInstance;

  protected get<T>(...args: Parameters<AxiosInstance['get']>) {
    return this.axiosInstance.get<T, T>(...args);
  }

  protected post<T>(...args: Parameters<AxiosInstance['post']>) {
    return this.axiosInstance.post<T, T>(...args);
  }

  protected put<T>(...args: Parameters<AxiosInstance['put']>) {
    return this.axiosInstance.put<T, T>(...args);
  }

  protected patch<T>(...args: Parameters<AxiosInstance['patch']>) {
    return this.axiosInstance.patch<T, T>(...args);
  }

  protected delete<T>(...args: Parameters<AxiosInstance['delete']>) {
    return this.axiosInstance.delete<T, T>(...args);
  }
}
