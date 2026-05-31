'use client';
import { FC, useState } from 'react';
import { useCreatePlaylist } from '@/features/playlist/add/api/use-create-playlist.mutation';
import { useFetchPlaylists } from '@/features/playlist/list';
import { useRemovePlaylist } from '@/features/playlist/remove/api/use-remove-playlist.mutation';
import { PlaylistType } from '@/shared/api/http/types/@enums';
import { Playlist } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { useDialog } from '@/shared/ui/components/dialog';
import { TextButton } from '@/shared/ui/components/text-button';
import { Typography } from '@/shared/ui/components/typography';
import { useFullscreenSheet } from '@/widgets-mobile/partyroom-djing-sheet';
import PlaylistDetailSheet from './playlist-detail-sheet.component';

const PlaylistsManagementSheet: FC = () => {
  const t = useI18n();
  const { push } = useFullscreenSheet();
  const { openConfirmDialog } = useDialog();
  const { data: playlists = [] } = useFetchPlaylists({ enabled: true });
  const { mutate: createPlaylist } = useCreatePlaylist();
  const { mutate: removePlaylist } = useRemovePlaylist();

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');

  const openDetail = (p: Playlist) =>
    push({
      key: `playlist-detail-${p.id}`,
      title: p.name,
      node: <PlaylistDetailSheet playlist={p} />,
    });

  const handleDelete = async (p: Playlist) => {
    const confirmed = await openConfirmDialog({ content: t.playlist.para.delete_playlist_confirm });
    if (confirmed) removePlaylist([p.id]);
  };

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    createPlaylist(
      { name: trimmed },
      {
        onSuccess: () => {
          setName('');
          setIsCreating(false);
        },
      }
    );
  };

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 overflow-y-auto'>
        {playlists.length === 0 ? (
          <div className='flex h-full items-center justify-center px-4'>
            <Typography type='body3' className='text-gray-400'>
              {t.partyroom.queue.playlists_empty}
            </Typography>
          </div>
        ) : (
          <ul className='flex flex-col divide-y divide-gray-800'>
            {playlists.map((p) => {
              const isGrab = p.type === PlaylistType.GRABLIST;
              return (
                <li key={p.id} className='flex items-center justify-between gap-3 px-4 py-4'>
                  <button
                    type='button'
                    data-testid={`manage-playlist-card-${p.id}`}
                    onClick={() => openDetail(p)}
                    className='flex-1 text-left min-w-0'
                  >
                    <Typography type='body3' className='truncate'>
                      {p.name}
                    </Typography>
                    <Typography type='detail2' className='text-gray-400'>
                      {p.musicCount}곡
                    </Typography>
                  </button>
                  {!isGrab && (
                    <TextButton
                      data-testid={`manage-playlist-delete-${p.id}`}
                      onClick={() => handleDelete(p)}
                      className='text-red-300 px-2 py-1'
                      typographyType='caption1'
                    >
                      {t.common.btn.delete}
                    </TextButton>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className='shrink-0 p-4 border-t border-gray-800'>
        {isCreating ? (
          <div className='flex gap-2'>
            <input
              data-testid='manage-create-input'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.partyroom.queue.create_playlist_placeholder}
              className='flex-1 min-w-0 rounded bg-gray-800 px-3 py-2 text-gray-50 outline-none'
            />
            <Button data-testid='manage-create-submit' onClick={handleCreate}>
              {t.partyroom.queue.create_playlist_submit}
            </Button>
          </div>
        ) : (
          <Button
            data-testid='manage-create-cta'
            variant='outline'
            color='secondary'
            onClick={() => setIsCreating(true)}
            className='w-full'
          >
            {t.partyroom.queue.create_playlist_cta}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PlaylistsManagementSheet;
