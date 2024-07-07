'use client';

import { useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect } from 'react';
import { useSuspenseFetchMe } from '@/entities/me';
import { AuthorityTier } from '@/shared/api/http/types/@enums';

const ProfileEditLayout = ({ children }: PropsWithChildren) => {
  const { data: me } = useSuspenseFetchMe();
  const router = useRouter();

  useEffect(() => {
    if (me.authorityTier === AuthorityTier.GT) {
      router.replace('/');
      return;
    }

    /**
     * 프로필을 등록한 사용자의 경우, 접근 불가
     */
    if (me.profileUpdated) {
      if (me.authorityTier === AuthorityTier.AM) {
        router.replace('/settings/avatar');
      }
      if (me.authorityTier === AuthorityTier.FM) {
        router.replace('/parties');
      }
    }
  }, [me]);

  return <>{children}</>;
};

export default ProfileEditLayout;
