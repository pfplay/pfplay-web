'use client';
import { FC } from 'react';
import { useFetchPlaylistTracks } from '@/features/playlist/list-tracks/api/use-fetch-playlist-tracks.query';
import { useRemovePlaylistTrack } from '@/features/playlist/remove-track/api/use-remove-playlist-track.mutation';
import { Playlist } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { Typography } from '@/shared/ui/components/typography';
import { useFullscreenSheet } from '@/widgets-mobile/partyroom-djing-sheet';
import AddTracksSheet from './add-tracks-sheet.component';

interface Props {
  playlist: Playlist;
}

const PlaylistDetailSheet: FC<Props> = ({ playlist }) => {
  const t = useI18n();
  const { push } = useFullscreenSheet();
  const { data } = useFetchPlaylistTracks(playlist.id);
  const { mutate: removeTrack } = useRemovePlaylistTrack();
  const tracks = data?.content ?? [];

  const openAddTracks = () =>
    push({
      key: 'add-tracks',
      title: t.partyroom.queue.sheet_add_tracks_title,
      node: <AddTracksSheet playlistId={playlist.id} />,
    });

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 overflow-y-auto'>
        {tracks.length === 0 ? (
          <div className='flex h-full items-center justify-center px-4'>
            <Typography type='body3' className='text-gray-400'>
              {t.partyroom.queue.playlist_tracks_empty}
            </Typography>
          </div>
        ) : (
          <ul className='flex flex-col divide-y divide-gray-800'>
            {tracks.map((track) => (
              <li key={track.trackId} className='flex items-center gap-3 px-4 py-3'>
                <img
                  src={track.thumbnailImage ?? '/images/ETC/PlaylistThumbnail.png'}
                  alt={track.name}
                  className='w-[64px] h-[36px] shrink-0 rounded object-cover bg-gray-700'
                />
                <Typography type='caption1' className='flex-1 min-w-0 truncate text-gray-50'>
                  {track.name}
                </Typography>
                <button
                  type='button'
                  data-testid={`detail-track-remove-${track.trackId}`}
                  onClick={() => removeTrack({ playlistId: playlist.id, trackId: track.trackId })}
                  className='shrink-0 px-2 py-1 text-gray-400'
                  aria-label={t.partyroom.queue.remove_track_label}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className='shrink-0 p-4 border-t border-gray-800'>
        <Button data-testid='detail-add-tracks' onClick={openAddTracks} className='w-full'>
          {t.partyroom.queue.add_tracks_cta}
        </Button>
      </div>
    </div>
  );
};

export default PlaylistDetailSheet;
