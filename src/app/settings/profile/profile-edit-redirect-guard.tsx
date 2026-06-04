'use client';

import { useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect } from 'react';
import { useSuspenseFetchMe } from '@/entities/me';
import { AuthorityTier } from '@/shared/api/http/types/@enums';

type Props = PropsWithChildren<{ device: 'mobile' | 'desktop' }>;

/**
 * 프로필 설정 페이지 접근 가드 + 완료 후 라우팅.
 *
 * 기존 동작 유지:
 * - GT(게스트)는 접근 불가 → '/'
 * - 프로필 등록 완료(FM)는 접근 불가 → '/parties'
 *
 * device-aware 분기(신규):
 * - 프로필 등록 완료 AM 은 데스크탑에서 아바타 설정으로 유도되지만,
 *   모바일은 아바타가 서버 자동셋팅이라 강제 단계를 건너뛰고 '/parties' 로.
 *   (모바일 아바타 편집은 의도적으로 desktop-only 안내 — 데드엔드 회피)
 */
const ProfileEditRedirectGuard = ({ device, children }: Props) => {
  const { data: me } = useSuspenseFetchMe();
  const router = useRouter();

  useEffect(() => {
    if (me.authorityTier === AuthorityTier.GT) {
      router.replace('/');
      return;
    }

    if (me.profileUpdated) {
      if (me.authorityTier === AuthorityTier.AM) {
        router.replace(device === 'mobile' ? '/parties' : '/settings/avatar');
      }
      if (me.authorityTier === AuthorityTier.FM) {
        router.replace('/parties');
      }
    }
  }, [me, device, router]);

  return <>{children}</>;
};

export default ProfileEditRedirectGuard;
