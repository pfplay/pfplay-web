import { useCreatePlaylist } from '@/features/playlist/add/api/use-create-playlist.mutation';
import { useAddPlaylistTrack } from '@/features/playlist/add-tracks';
import { useFetchPlaylists } from '@/features/playlist/list';
import { Music } from '@/shared/api/http/types/playlists';
import { useDialog } from '@/shared/ui/components/dialog';
import theme from '@/shared/ui/foundation/theme';
import SearchTrackForDjing from './search-track-for-djing.component';
import { useRegisterMeToQueue } from '../../register-me-to-queue';

type RegisterDjWithTrackParams = {
  partyroomId: number;
  closeDjingDialog?: () => void;
};

export default function useRegisterDjWithTrack() {
  const { openDialog } = useDialog();
  const { data: playlists = [] } = useFetchPlaylists();
  const { mutateAsync: createPlaylist } = useCreatePlaylist();
  const { mutateAsync: addTrackToPlaylist } = useAddPlaylistTrack();
  const { mutate: registerMeToQueue } = useRegisterMeToQueue();

  const openTrackSearchDialog = (closeDjingDialog?: () => void) =>
    openDialog<Music>((onSelect, onCancel) => ({
      zIndex: theme.zIndex.dialog + 1,
      closeWhenOverlayClicked: false,
      classNames: { container: '!p-[unset] w-[1000px] bg-black border border-gray-700' },
      Body: (
        <SearchTrackForDjing
          onSelectTrack={onSelect}
          onBackToDjingDialog={() => onCancel?.()}
          onCloseAll={() => {
            onCancel?.();
            closeDjingDialog?.();
          }}
        />
      ),
    }));

  // 대기열 등록은 플레이리스트 단위로만 가능하다. 곡 하나로 등록하려면 담을 그릇이 필요해
  // 오늘 날짜 이름의 플레이리스트를 쓰고, 같은 날 재등록 시엔 목록이 불어나지 않게 재사용한다.
  const getPlaylistForToday = async () => {
    const name = new Date().toLocaleDateString('en-CA'); // 'en-CA' = YYYY-MM-DD

    return playlists.find((playlist) => playlist.name === name) ?? (await createPlaylist({ name }));
  };

  return async ({ partyroomId, closeDjingDialog }: RegisterDjWithTrackParams) => {
    const selectedTrack = await openTrackSearchDialog(closeDjingDialog);
    if (!selectedTrack) return;

    const playlist = await getPlaylistForToday();

    await addTrackToPlaylist({
      listId: playlist.id,
      linkId: selectedTrack.videoId,
      name: selectedTrack.videoTitle,
      duration: selectedTrack.runningTime,
      thumbnailImage: selectedTrack.thumbnailUrl,
    });

    registerMeToQueue({ partyroomId, playlistId: playlist.id });
    closeDjingDialog?.();
  };
}
