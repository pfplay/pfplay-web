'use client';

import { useEffect } from 'react';
import { useAppRouter } from '@/shared/lib/router/use-app-router.hook';

const TABLET_BREAKPOINT = 768;

export const useMobileGuard = () => {
  const router = useAppRouter();

  useEffect(() => {
    if (window.location.pathname === '/mobile-notice') return;
    if (window.innerWidth < TABLET_BREAKPOINT) {
      router.push('/mobile-notice');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

const MobileGuard = () => {
  useMobileGuard();
  return null;
};

export default MobileGuard;
