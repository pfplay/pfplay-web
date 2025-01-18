import { useCallback } from 'react';
import { usersService } from '@/shared/api/http/services';

export default function useSignIn() {
  return useCallback(() => {
    usersService.signIn({
      oauth2Provider: 'google',
    });
  }, []);
}
