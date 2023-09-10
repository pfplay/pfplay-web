'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { routes } from '@/constants/routes';

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
    router.replace('/');
    return null;
  }

  if (session?.user.accessToken && (pathname === '/sign-in' || pathname === '/')) {
    router.replace(`${routes.parties.base}`);
    return null;
  }

  return children;
};

export default SessionCheck;
