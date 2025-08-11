'use client';

import { useEffect } from 'react';
import { useSocialSignInCallback } from '@/features/sign-in/by-social';

export default function TwitterCallbackPage() {
  const handleCallback = useSocialSignInCallback();

  useEffect(() => {
    handleCallback('twitter');
  }, [handleCallback]);

  return null;
}
