'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';
import { ROUTES } from '@/utils/routes';

interface SessionCheckProps {
  children: ReactNode;
}

const SessionCheck = ({ children }: SessionCheckProps) => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (!session?.user.accessToken && pathname !== '/' && pathname !== '/sign-in') {
    router.replace(ROUTES.HOME.index);
    return null;
  }

  if (session?.user.accessToken && (pathname === '/sign-in' || pathname === '/')) {
    router.replace(ROUTES.PARTIES.index);
    return null;
  }

  /**
   * TODO:
   * 1. Auth middleware 개발 시 middleware에서 session 없어도 parties 갈 수 있게 추가 대응 필요
   * 2. 프로파일 설정이 되어있지 않으면 프로파일 설정 페이지로 이동
   */
  return children;
};

export default SessionCheck;
