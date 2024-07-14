'use client';

import { useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect } from 'react';
import { useSuspenseFetchMe } from '@/entities/me';

const ProtectedLayout = ({ children }: PropsWithChildren) => {
  const { data: me } = useSuspenseFetchMe();
  const router = useRouter();

  useEffect(() => {
    /**
     * 로그인은 했지만 프로필을 아직 생성하지 않은 경우
     */
    if (!me.profileUpdated) {
      router.replace('/settings/profile');
    }
  }, []);

  return <>{children}</>;
};

export default ProtectedLayout;
