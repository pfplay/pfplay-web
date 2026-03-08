'use client';

import { useEffect, useRef } from 'react';
import { useSocialSignInCallback } from '@/features/sign-in/by-social';

export default function TwitterCallbackPage() {
  const handleCallback = useSocialSignInCallback();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;
    handleCallback('twitter');
  }, [handleCallback]);

  return null;
}
