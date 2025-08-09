'use client';

import { useEffect } from 'react';
import { useOAuth2Callback } from '@/features/sign-in/by-oauth2';

export default function GoogleCallbackPage() {
  const { handleCallback } = useOAuth2Callback();

  useEffect(() => {
    handleCallback();
  }, [handleCallback]);

  return null;
}
