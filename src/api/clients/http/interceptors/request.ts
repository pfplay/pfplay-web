import { getSession } from 'next-auth/react';
import { AxiosRequestHeaders, InternalAxiosRequestConfig } from 'axios';
import { getServerAuthSession } from '@/utils/authOptions';
import { printRequestLog } from '@/utils/log';

const publicRoutes = new Set<string>([]); // TODO: accessToken 필요 없는 api url 추가
export async function setAccessToken(config: InternalAxiosRequestConfig) {
  if (config.url && publicRoutes.has(config.url)) {
    return config;
  }

  const session = (await getSession()) ?? (await getServerAuthSession());

  if (!session) {
    return config;
  }

  (config.headers as AxiosRequestHeaders)['Authorization'] = `Bearer ${session.user.accessToken}`;
  return config;
}

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