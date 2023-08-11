import { getSession } from 'next-auth/react';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const API_HOST_NAME = process.env.NEXT_PUBLIC_API_HOST_NAME;

const defaultHeader = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

const createHeaderWithAuthToken = (token?: string) => {
  if (!token) {
    return defaultHeader;
  }

  return {
    ...defaultHeader,
    Authorization: `Bearer ${token}`,
  };
};

const createHeaderWithSessionAuthToken = async () => {
  const session = await getSession();

  if (!session) {
    throw new Error('Auth Error : session not set');
  }

  return createHeaderWithAuthToken(session?.user?.accessToken);
};

const request = async (options: AxiosRequestConfig) => {
  try {
    const response = await axios({
      baseURL: API_HOST_NAME,
      timeout: 30000,
      withCredentials: true, // 쿠키 전송 허용
      ...options,
    });

    return response;
  } catch (err) {
    console.log(err);
  }
};

export const publicRequest = async <T>(
  options: AxiosRequestConfig
): Promise<AxiosResponse<T> | undefined> => {
  const headers = { ...defaultHeader, ...options.headers };

  return request({ ...options, headers });
};

export const requestWithAuth = async (options: AxiosRequestConfig) => {
  const headers = { ...(await createHeaderWithSessionAuthToken()), ...options.headers };

  return request({ ...options, headers });
};
