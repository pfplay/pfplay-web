'use client';

import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect } from 'react';
import { useFetchMe } from '@/entities/me';
import { GUEST_AUTO_LOGIN_ROUTE_PATTERN } from '@/entities/me/model/constants';
import { usePartyroomEnterErrorAlerts } from '@/features/partyroom/enter';
import { useAutoSignInByGuest } from '@/features/sign-in/by-guest';
import isAuthError from '@/shared/api/http/error/is-auth-error';
import { SidebarPlayer, ModalPlayer } from '@/widgets/music-preview-player';
import { MyPlaylist } from '@/widgets/my-playlist';
import PlaylistActionProvider from './playlist-action.provider';

const ProtectedLayout = ({ children }: PropsWithChildren) => {
  const { data: me, error, isLoading } = useFetchMe();
  const pathname = usePathname();
  const router = useRouter();

  const isPartyroomRoute = GUEST_AUTO_LOGIN_ROUTE_PATTERN.test(pathname);
  const partyroomIdFromPath = isPartyroomRoute ? Number(pathname.split('/')[2]) : null;
  const { isSigningIn } = useAutoSignInByGuest(error, partyroomIdFromPath);

  /**
   * 비로그인 상태에서 로비 등 파티룸이 아닌 라우트 접속 시 홈으로 리다이렉트
   */
  useEffect(() => {
    if (error && isAuthError(error) && !isPartyroomRoute) {
      location.href = '/';
    }
  }, [error, isPartyroomRoute]);

  useEffect(() => {
    /**
     * 로그인은 했지만 프로필을 아직 생성하지 않은 경우
     */
    if (me && !me.profileUpdated) {
      router.replace('/settings/profile');
    }
  }, [me, router]);

  usePartyroomEnterErrorAlerts();

  if (isLoading || isSigningIn || !me) {
    return null;
  }

  return (
    <PlaylistActionProvider>
      {children}
      <MyPlaylist />

      {/* ⓐ 사이드바 미리보기 플레이어 (플레이리스트 트랙용) */}
      <SidebarPlayer />

      {/* ⓑ 모달 미리보기 플레이어 (검색 결과용) - 모달과 분리된 고정 위치 */}
      <ModalPlayer />
    </PlaylistActionProvider>
  );
};

export default ProtectedLayout;
