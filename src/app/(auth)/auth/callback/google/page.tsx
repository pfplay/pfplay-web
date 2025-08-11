'use client';

import { useEffect } from 'react';
import { useSocialSignInCallback } from '@/features/sign-in/by-social';

export default function GoogleCallbackPage() {
  const handleCallback = useSocialSignInCallback();

  useEffect(() => {
    handleCallback('google');
  }, [handleCallback]);

  return null;
}
