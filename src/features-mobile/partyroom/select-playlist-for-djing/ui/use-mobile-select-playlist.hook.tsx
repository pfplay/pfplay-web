'use client';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { Playlist } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
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
 * - playlists=[] → confirm dialog → confirm 시 /me/playlist push, resolve(undefined)
 * - every musicCount===0 → SelectPlaylistSheet (빈 곡 카드의 [+ 곡 추가] CTA → AddTracksSheet — Phase 6)
 * - 정상 → SelectPlaylistSheet, 카드 선택 → resolve(playlist)
 *
 * 데스크탑 hook 의 drawer 의존 모두 제거 (모바일은 PlaylistDrawer OUT scope).
 */
export default function useMobileSelectPlaylist({
  playlists,
}: Args): () => Promise<Playlist | void> {
  const t = useI18n();
  const router = useRouter();
  const { openConfirmDialog } = useDialog();
  const { push, pop } = useFullscreenSheet();

  return useCallback(async () => {
    if (playlists.length === 0) {
      const confirmed = await openConfirmDialog({
        content: t.dj.para.create_playlist_song,
      });
      if (confirmed) router.push('/me/playlist');
      return undefined;
    }

    return new Promise<Playlist | void>((resolve) => {
      push({
        key: 'select-playlist',
        title: t.partyroom.queue.sheet_select_playlist_title,
        node: (
          <SelectPlaylistSheet
            playlists={playlists}
            // ⚠️ resolve 가 반드시 pop() 보다 먼저. useFullscreenSheet.pop() 의 setState
            // updater 가 동기적으로 top.onClose?.() 를 호출 → onClose=()=>resolve(undefined)
            // 가 winning. 본 hook 의 calling 순서에 따라 final resolve 값이 결정된다.
            // (Promise resolve 는 idempotent — 첫 resolve 가 win, 그 후는 no-op.)
            onConfirm={(p) => {
              resolve(p);
              pop();
            }}
            onCancel={() => {
              resolve(undefined);
              pop();
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
        onClose: () => resolve(undefined),
      });
    });
  }, [
    playlists,
    router,
    openConfirmDialog,
    push,
    pop,
    t.dj.para.create_playlist_song,
    t.partyroom.queue.sheet_select_playlist_title,
    t.partyroom.queue.sheet_add_tracks_title,
  ]);
}
