import axios, { AxiosInstance, CreateAxiosDefaults } from 'axios';
import { logRequest, setAccessToken } from '@/shared/api/clients/http/interceptors/request';
import {
  logError,
  logResponse,
  processError,
  unwrapResponse,
} from '@/shared/api/clients/http/interceptors/response';
import { flow } from '@/shared/lib/functions/flow';

const createAxiosInstance = (baseURL?: string, options?: CreateAxiosDefaults): AxiosInstance => {
  return axios.create({
    baseURL,
    timeout: 4000,
    validateStatus: (status) => status >= 200 && status < 400,
    ...options,
  });
};

export const pfpAxiosInstance = createAxiosInstance(process.env.NEXT_PUBLIC_API_HOST_NAME);
pfpAxiosInstance.interceptors.request.use(flow([setAccessToken, logRequest]));
pfpAxiosInstance.interceptors.response.use(
  flow([logResponse, unwrapResponse]),
  flow([logError, processError])
);

export const nextAxiosInstance = createAxiosInstance('/api');
nextAxiosInstance.interceptors.request.use(flow([logRequest]));
nextAxiosInstance.interceptors.response.use(flow([logResponse, unwrapResponse]), logError);
