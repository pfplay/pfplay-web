import { useCallback } from 'react';
import UsersService from '@/shared/api/http/services/users';

export default function useSignIn() {
  return useCallback(() => {
    UsersService.signIn({
      oauth2Provider: 'google',
    });
  }, []);
}
