'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { NO_AUTH_ROUTES, ROUTES } from '@/utils/routes';

interface SessionCheckProps {
  children: React.ReactNode;
}

const SessionCheck = ({ children }: SessionCheckProps) => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (!session?.user.accessToken && pathname !== '/' && pathname !== '/sign-in') {
    router.replace(NO_AUTH_ROUTES.HOME.index);
    return null;
  }

  if (session?.user.accessToken && (pathname === '/sign-in' || pathname === '/')) {
    router.replace(ROUTES.PARTIES.index);
    return null;
  }

  // FIXME: Auth middleware 개발 시 middleware에서 session 없어도 parties 갈 수 있게 추가 대응 필요

  return children;
};

export default SessionCheck;
