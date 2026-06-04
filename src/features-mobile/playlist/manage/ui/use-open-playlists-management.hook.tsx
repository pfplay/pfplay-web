'use client';
import { useCallback } from 'react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useFullscreenSheet } from '@/widgets-mobile/partyroom-djing-sheet';
import PlaylistsManagementSheet from '@/widgets-mobile/partyroom-djing-sheet/ui/playlists-management-sheet.component';

/**
 * 모바일 "내 플레이리스트 관리" 진입 hook (spec §5).
 * queue 탭 MemberActions 와 DJ 등록 빈-플리 회귀 보정 두 곳이 공유.
 * L1(PlaylistsManagementSheet) 를 fullscreen sheet stack 에 push 한다.
 */
export default function useOpenPlaylistsManagement(): () => void {
  const t = useI18n();
  const { push } = useFullscreenSheet();

  return useCallback(() => {
    push({
      key: 'playlists-management',
      title: t.partyroom.queue.sheet_playlists_management_title,
      node: <PlaylistsManagementSheet />,
    });
  }, [push, t.partyroom.queue.sheet_playlists_management_title]);
}
