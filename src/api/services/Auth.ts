import { AuthClient } from '@/api/@types/Auth';
import { axiosInstance } from '@/api/client';

// const ROUTE = 'auth';

export const AuthService: AuthClient = {
  login: async (request) => {
    // TODO: 유진님께 질문할 것: 맨 앞에 'auth/' 가 왜 안붙는지?
    return await axiosInstance.post('v1/user/info', request);
  },
};
