import { publicRequest } from '@pages/api/requester';
import { loginResponse } from 'type/auth';

export const login = async (email: string) =>
  publicRequest<loginResponse>({
    url: '/auth/login',
    method: 'POST',
    data: {
      email,
    },
  });
