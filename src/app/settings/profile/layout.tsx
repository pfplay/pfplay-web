'use client';

import { router } from 'next/client';
import { PropsWithChildren, useEffect } from 'react';
import { useFetchMe } from '@/entities/me';

const ProfileEditLayout = ({ children }: PropsWithChildren) => {
  const { data: me } = useFetchMe();

  useEffect(() => {
    /**
     * 프로필을 등록한 사용자의 경우, 접근 불가
     */
    if (me && me.profileUpdated) {
      router.replace('/parties');
    }
  }, [me]);

  return <>{children}</>;
};

export default ProfileEditLayout;
