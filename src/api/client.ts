import axios from 'axios';
import { flow } from '@/utils/flow';
import { logRequest } from './interceptors/request';
import { logError, logResponse, unwrapResponse } from './interceptors/response';

export const axiosInstance = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '<production_url>' : '<development_url>', // FIXME: url 확인 후 삽입
  timeout: 4000,
  validateStatus: (status) => status >= 200 && status < 400,
});

axiosInstance.interceptors.request.use(logRequest);
axiosInstance.interceptors.response.use(flow([logResponse, unwrapResponse]), logError);
