'use client';

import { useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect } from 'react';
import { useSuspenseFetchMe } from '@/entities/me';
import { usePartyroomEnterErrorAlerts } from '@/features/partyroom/enter';
import { SidebarPlayer, ModalPlayer } from '@/widgets/music-preview-player';
import { MyPlaylist } from '@/widgets/my-playlist';
import PlaylistActionProvider from './playlist-action.provider';

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
  }, [me.profileUpdated, router]);

  usePartyroomEnterErrorAlerts();

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
