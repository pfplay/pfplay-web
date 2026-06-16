'use client';

import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect } from 'react';
import { useFetchMe } from '@/entities/me';
import { GUEST_AUTO_LOGIN_ROUTE_PATTERN } from '@/entities/me/model/constants';
import { usePartyroomEnterErrorAlerts } from '@/features/partyroom/enter';
import { useAutoSignInByGuest } from '@/features/sign-in/by-guest';
import isAuthError from '@/shared/api/http/error/is-auth-error';
import PlaylistActionProvider from './playlist-action.provider';
import PartyroomConnectionProvider from '../_providers/partyroom-connection.provider';

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

  if (isLoading || isSigningIn || !me || !me.profileUpdated) {
    return null;
  }

  // 데스크탑 전용 overlay(MyPlaylist · SidebarPlayer) 는
  // DesktopLobby · DesktopRoom 내부의 DesktopOverlays 로 이동(chunk 1).
  // (검색 결과 미리듣기는 검색 모달 내부 SearchPreviewPanel 로 임베드 — issue #420)
  // 모바일 트리는 본 overlay 를 import 하지 않음 (격리 가치 첫 실현).
  return (
    <PartyroomConnectionProvider>
      <PlaylistActionProvider>{children}</PlaylistActionProvider>
    </PartyroomConnectionProvider>
  );
};

export default ProtectedLayout;
