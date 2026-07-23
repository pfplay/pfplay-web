import { Music } from '@/shared/api/http/types/playlists';
import { useDialog } from '@/shared/ui/components/dialog';
import theme from '@/shared/ui/foundation/theme';
import SearchTrackForDjing from './search-track-for-djing.component';
import { useQuickRegisterMeToQueue } from '../api/use-quick-register-me-to-queue.mutation';

type RegisterDjWithTrackParams = {
  partyroomId: number;
  closeDjingDialog?: () => void;
};

export default function useRegisterDjWithTrack() {
  const { openDialog } = useDialog();
  const { mutate: quickRegisterMeToQueue } = useQuickRegisterMeToQueue();

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

  return async ({ partyroomId, closeDjingDialog }: RegisterDjWithTrackParams) => {
    const selectedTrack = await openTrackSearchDialog(closeDjingDialog);
    if (!selectedTrack) return;

    quickRegisterMeToQueue({
      partyroomId,
      name: selectedTrack.videoTitle,
      linkId: selectedTrack.videoId,
      duration: selectedTrack.runningTime,
      thumbnailImage: selectedTrack.thumbnailUrl,
    });

    closeDjingDialog?.();
  };
}
