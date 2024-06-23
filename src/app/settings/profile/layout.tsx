'use client';

import { router } from 'next/client';
import { PropsWithChildren, useEffect } from 'react';
import { useSuspenseFetchMe } from '@/entities/me';

const ProfileEditLayout = ({ children }: PropsWithChildren) => {
  const { data: me } = useSuspenseFetchMe();

  useEffect(() => {
    /**
     * 프로필을 등록한 사용자의 경우, 접근 불가
     */
    if (me.profileUpdated) {
      router.replace('/parties');
    }
  }, [me.profileUpdated]);

  return <>{children}</>;
};

export default ProfileEditLayout;
