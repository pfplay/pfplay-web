import { publicRequest } from '@/pages/api/requester';
import { ILoginResponse } from '@/types/auth';

export const login = async (email: string) =>
  publicRequest<ILoginResponse>({
    // TODO: Check the endpoint and replace with routes config
    url: '/auth/login',
    method: 'POST',
    data: {
      email,
    },
  });
