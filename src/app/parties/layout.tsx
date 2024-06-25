'use client';

import { useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect } from 'react';
import { useFetchMe } from '@/entities/me';

const ProtectedLayout = ({ children }: PropsWithChildren) => {
  const { data: me } = useFetchMe();
  const router = useRouter();

  useEffect(() => {
    /**
     * 로그인은 했지만 프로필을 아직 생성하지 않은 경우
     */
    if (me && !me.profileUpdated) {
      router.replace('/settings/profile');
    }
  }, [me]);

  return <>{children}</>;
};

export default ProtectedLayout;
