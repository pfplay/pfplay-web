import { publicRequest } from '@/pages/api/requester'
import { ILoginResponse } from '@/types/auth'

export const login = async (email: string) =>
  publicRequest<ILoginResponse>({
    url: '/auth/login',
    method: 'POST',
    data: {
      email,
    },
  })
