'use client';

import { useEffect } from 'react';
import { useOAuth2Callback } from '@/features/sign-in/by-oauth2';

export default function TwitterCallbackPage() {
  const { handleCallback } = useOAuth2Callback('twitter');

  useEffect(() => {
    handleCallback();
  }, [handleCallback]);

  return null;
}
