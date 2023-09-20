import axios from 'axios';
import { flow } from '@/utils/flow';
import { logRequest, setAccessToken } from './interceptors/request';
import { logError, logResponse, processError, unwrapResponse } from './interceptors/response';

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_HOST_NAME,
  timeout: 4000,
  validateStatus: (status) => status >= 200 && status < 400,
});

axiosInstance.interceptors.request.use(flow([setAccessToken, logRequest]));
axiosInstance.interceptors.response.use(
  flow([logResponse, unwrapResponse]),
  flow([logError, processError])
);
