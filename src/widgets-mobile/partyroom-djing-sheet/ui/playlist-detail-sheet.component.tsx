'use client';
import { FC } from 'react';
import { useFetchPlaylistTracks } from '@/features/playlist/list-tracks/api/use-fetch-playlist-tracks.query';
import { resolveNextTrackId } from '@/features/playlist/list-tracks/lib/resolve-next-track';
import { useRemovePlaylistTrack } from '@/features/playlist/remove-track/api/use-remove-playlist-track.mutation';
import { Playlist } from '@/shared/api/http/types/playlists';
import { cn } from '@/shared/lib/functions/cn';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { Button } from '@/shared/ui/components/button';
import { Typography } from '@/shared/ui/components/typography';
import { PFClose } from '@/shared/ui/icons';
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
  const [me, currentDj] = useStores().useCurrentPartyroom((state) => [state.me, state.currentDj]);
  const tracks = data?.content ?? [];

  // 재생 커서 기반 NOW/NEXT (데스크톱 TracksInPlaylist와 동일 규칙).
  const cursor = data?.lastPlayedTrackId ?? null;
  const isMeCurrentDj = me?.crewId != null && me.crewId === currentDj?.crewId;
  const nextTrackId = resolveNextTrackId(
    tracks.map((track) => track.trackId),
    cursor
  );
  const nowTrackId = isMeCurrentDj ? cursor : null;

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
          <div className='flex h-full items-center justify-center px-5'>
            <Typography type='body3' className='text-gray-400'>
              {t.partyroom.queue.playlist_tracks_empty}
            </Typography>
          </div>
        ) : (
          <ul className='flex flex-col divide-y divide-gray-800'>
            {tracks.map((track) => {
              const isNow = nowTrackId !== null && track.trackId === nowTrackId;
              const isNext = !isNow && nextTrackId !== null && track.trackId === nextTrackId;
              return (
                <li key={track.trackId} className='flex items-center gap-3 px-5 py-3'>
                  <img
                    src={track.thumbnailImage ?? '/images/ETC/PlaylistThumbnail.png'}
                    alt={track.name}
                    className='w-[64px] h-[36px] shrink-0 rounded object-cover bg-gray-700'
                  />
                  <div className='flex-1 min-w-0 flex flex-col'>
                    {(isNow || isNext) && (
                      <span
                        data-testid={isNow ? 'track-badge-now' : 'track-badge-next'}
                        className={cn(
                          'mb-0.5 inline-flex w-fit items-center rounded-[3px] px-1.5 py-[1px] text-[10px] font-bold leading-[14px]',
                          isNow ? 'bg-red-300 text-white' : 'bg-gray-600 text-gray-100'
                        )}
                      >
                        {isNow ? t.playlist.para.now_playing : t.playlist.para.next_up}
                      </span>
                    )}
                    <Typography type='caption1' className='min-w-0 truncate text-gray-50'>
                      {track.name}
                    </Typography>
                  </div>
                  <button
                    type='button'
                    data-testid={`detail-track-remove-${track.trackId}`}
                    onClick={() => removeTrack({ playlistId: playlist.id, trackId: track.trackId })}
                    className='shrink-0 px-2 py-1 text-gray-400'
                    aria-label={t.partyroom.queue.remove_track_label}
                  >
                    <PFClose width={20} height={20} aria-hidden='true' />
                  </button>
                </li>
              );
            })}
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
