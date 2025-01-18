import { usePlaylistAction } from '@/entities/playlist';
import { Playlist } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { PFDelete } from '@/shared/ui/icons';
import Track from './track.component';
import { useFetchPlaylistTracks } from '../api/use-fetch-playlist-tracks.query';

type TracksInPlaylistProps = {
  playlist: Playlist;
};

const TracksInPlaylist = ({ playlist }: TracksInPlaylistProps) => {
  const t = useI18n();
  const { data } = useFetchPlaylistTracks(playlist.id);
  const playlistAction = usePlaylistAction();

  return (
    <div className='flex flex-col gap-3'>
      {data?.content.map((track) => (
        <Track
          key={track.linkId}
          track={track}
          menuItems={[
            {
              onClickItem: () => playlistAction.removeTrack(playlist.id, track.linkId),
              label: t.playlist.btn.delete_playlist,
              Icon: <PFDelete />,
            },
            // TODO: 구현되면 주석 해제
            // {
            //   onClickItem: () => alert('Not Impl'),
            //   label: t.playlist.btn.move_playlist,
            //   Icon: <PFAddPlaylist />,
            // },
          ]}
        />
      ))}
    </div>
  );
};

export default TracksInPlaylist;
