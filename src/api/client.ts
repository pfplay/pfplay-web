import axios, { AxiosInstance, CreateAxiosDefaults } from 'axios';
import { flow } from '@/utils/flow';
import { logRequest, setAccessToken } from './interceptors/request';
import { logError, logResponse, processError, unwrapResponse } from './interceptors/response';

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

export const nextAxiosInstance = createAxiosInstance('http://localhost:3000/api');
nextAxiosInstance.interceptors.request.use(flow([logRequest]));
nextAxiosInstance.interceptors.response.use(flow([logResponse, unwrapResponse]), logError);
