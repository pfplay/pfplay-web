'use client';
import { useRouter } from 'next/navigation';
import { FC, useCallback } from 'react';
import { Playlist } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import { useFullscreenSheet } from '@/widgets-mobile/partyroom-djing-sheet';
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
        title: '플레이리스트 선택',
        node: (
          <SelectPlaylistSheet
            playlists={playlists}
            onConfirm={(p) => {
              pop();
              resolve(p);
            }}
            onCancel={() => {
              pop();
              resolve(undefined);
            }}
            onAddTracksForEmpty={(p) => {
              // Phase 6 에서 AddTracksSheet 로 교체됨. 본 phase 는 placeholder.
              push({
                key: 'add-tracks',
                title: '곡 추가',
                node: <PendingAddTracksPlaceholder playlistId={p.id} />,
              });
            }}
          />
        ),
        onClose: () => resolve(undefined),
      });
    });
  }, [playlists, router, openConfirmDialog, push, pop, t.dj.para.create_playlist_song]);
}

// Phase 6 의 AddTracksSheet 컴포넌트로 교체 예정 — Phase 4 단계엔 placeholder.
const PendingAddTracksPlaceholder: FC<{ playlistId: number }> = ({ playlistId }) => (
  <div data-testid='pending-add-tracks' data-playlist-id={playlistId} />
);
