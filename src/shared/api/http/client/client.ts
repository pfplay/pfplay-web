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

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_HOST_NAME,
  timeout: 4000,
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
