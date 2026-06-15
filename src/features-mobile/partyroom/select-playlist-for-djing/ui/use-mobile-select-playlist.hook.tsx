'use client';
import { useCallback } from 'react';
import { useOpenPlaylistsManagement } from '@/features-mobile/playlist/manage';
import { Playlist } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useFullscreenSheet } from '@/widgets-mobile/partyroom-djing-sheet';
import AddTracksSheet from '@/widgets-mobile/partyroom-djing-sheet/ui/add-tracks-sheet.component';
import SelectPlaylistSheet from '@/widgets-mobile/partyroom-djing-sheet/ui/select-playlist-sheet.component';

interface Args {
  playlists: Playlist[];
}

/**
 * 모바일 셀렉터. 데스크탑 `useSelectPlaylistForDjing` 의 사본 (spec §5.4).
 *
 * contract: `() => Promise<Playlist | void>`
 *
 * 분기:
 * - playlists=[] → PlaylistsManagementSheet(L1) push, resolve(undefined).
 *   (chunk 6 회귀 보정: 기존 confirm→`/me/playlist` 데스크탑 튕김 경로 제거 — spec §7.3)
 * - every musicCount===0 → SelectPlaylistSheet (빈 곡 카드의 [+ 곡 추가] CTA → AddTracksSheet)
 * - 정상 → SelectPlaylistSheet, 카드 선택 → resolve(playlist)
 *
 * 데스크탑 hook 의 drawer 의존 모두 제거 (모바일은 PlaylistDrawer OUT scope).
 */
export default function useMobileSelectPlaylist({
  playlists,
}: Args): () => Promise<Playlist | void> {
  const t = useI18n();
  const { push, pop } = useFullscreenSheet();
  const openManage = useOpenPlaylistsManagement();

  return useCallback(async () => {
    if (playlists.length === 0) {
      // 곡이 든 플리가 하나도 없으면 데스크탑 `/me/playlist` 로 보내지 않고
      // 룸 내부 관리 sheet 를 띄워 그 자리에서 플리/곡 준비를 마치게 한다.
      openManage();
      return undefined;
    }

    return new Promise<Playlist | void>((resolve) => {
      push({
        key: 'select-playlist',
        title: t.partyroom.queue.sheet_select_playlist_title,
        node: (
          <SelectPlaylistSheet
            playlists={playlists}
            // confirm/cancel 은 자체 결과를 먼저 확정하고 programmatic 으로 닫는다.
            // pop({ programmatic: true }) 가 onDismiss(=취소 resolve)를 skip 하므로
            // resolve↔pop 호출 순서에 의존하지 않는다(과거 footgun 제거).
            onConfirm={(p) => {
              resolve(p);
              pop({ programmatic: true });
            }}
            onCancel={() => {
              resolve(undefined);
              pop({ programmatic: true });
            }}
            onAddTracksForEmpty={(p) => {
              push({
                key: 'add-tracks',
                title: t.partyroom.queue.sheet_add_tracks_title,
                node: <AddTracksSheet playlistId={p.id} />,
              });
            }}
          />
        ),
        // 사용자가 뒤로가기/×/Esc 로 닫으면 선택 취소(undefined).
        onDismiss: () => resolve(undefined),
      });
    });
  }, [
    playlists,
    openManage,
    push,
    pop,
    t.partyroom.queue.sheet_select_playlist_title,
    t.partyroom.queue.sheet_add_tracks_title,
  ]);
}
