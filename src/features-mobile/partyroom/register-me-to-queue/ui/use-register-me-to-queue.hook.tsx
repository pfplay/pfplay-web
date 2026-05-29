'use client';
import { useCallback } from 'react';
import { useRegisterMeToQueue } from '@/features/partyroom/register-me-to-queue';
import { useMobileSelectPlaylist } from '@/features-mobile/partyroom/select-playlist-for-djing';
import { useMobileDjingGuide } from '@/features-mobile/playlist/djing-guide';
import { QueueStatus } from '@/shared/api/http/types/@enums';
import { Playlist } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';

interface Args {
  partyroomId: number;
  queueStatus: QueueStatus;
  playlists: Playlist[];
}

export default function useMobileRegisterMeToQueue({ partyroomId, queueStatus, playlists }: Args) {
  const t = useI18n();
  const { openAlertDialog } = useDialog();
  const { mutate: registerMutate } = useRegisterMeToQueue();
  const selectPlaylist = useMobileSelectPlaylist({ playlists });
  const { showDjingGuide, openDjingGuideModal } = useMobileDjingGuide();

  return useCallback(async () => {
    if (queueStatus === QueueStatus.CLOSE) {
      await openAlertDialog({ content: t.dj.para.locked_queue_by_admin });
      return;
    }
    const selected = await selectPlaylist();
    if (!selected) return;
    registerMutate({ partyroomId, playlistId: selected.id });
    if (showDjingGuide) openDjingGuideModal();
  }, [
    partyroomId,
    queueStatus,
    selectPlaylist,
    registerMutate,
    showDjingGuide,
    openDjingGuideModal,
    openAlertDialog,
    t.dj.para.locked_queue_by_admin,
  ]);
}
