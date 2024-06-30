import axios, { AxiosInstance, CreateAxiosDefaults } from 'axios';
import { flow } from '@/shared/lib/functions/flow';
import { logRequest } from './interceptors/request';
import { logError, logResponse, processError, unwrapResponse } from './interceptors/response';

const createAxiosInstance = (baseURL?: string, options?: CreateAxiosDefaults): AxiosInstance => {
  return axios.create({
    baseURL,
    timeout: 4000,
    validateStatus: (status) => status >= 200 && status < 400,
    withCredentials: true,
    ...options,
  });
};

export const pfpAxiosInstance = createAxiosInstance(process.env.NEXT_PUBLIC_API_HOST_NAME);
pfpAxiosInstance.interceptors.request.use(flow([logRequest]));
pfpAxiosInstance.interceptors.response.use(
  flow([logResponse, unwrapResponse]),
  flow([logError, processError])
);

export const nextAxiosInstance = createAxiosInstance('/api');
nextAxiosInstance.interceptors.request.use(flow([logRequest]));
nextAxiosInstance.interceptors.response.use(flow([logResponse, unwrapResponse]), logError);