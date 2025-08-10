'use client';

import { useEffect } from 'react';
import { useOAuth2Callback } from '@/features/sign-in/by-oauth2';

export default function TwitterCallbackPage() {
  const handleCallback = useOAuth2Callback();

  useEffect(() => {
    handleCallback('twitter');
  }, [handleCallback]); // handleCallback을 의존성 배열에 추가

  return null;
}
