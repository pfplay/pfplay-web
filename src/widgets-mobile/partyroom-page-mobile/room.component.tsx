'use client';

import { useRouter } from 'next/navigation';
import { FC, useEffect, useRef, useState } from 'react';
import { useIsGuest } from '@/entities/me';
import { ProfileEditFormV2 } from '@/features/edit-profile-bio';
import { useFetchPartyroomDetailSummary } from '@/features/partyroom/get-summary';
import { useSharePartyroom } from '@/features/partyroom/share-link';
import { useInformSocialType } from '@/features/sign-in/by-social';
import { useOpenPlaylistsManagement } from '@/features-mobile/playlist/manage';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';
import MobilePartyroomChatPanel from '@/widgets-mobile/partyroom-chat-panel/partyroom-chat-panel.component';
import { MobilePartyroomDisplayBoard } from '@/widgets-mobile/partyroom-display-board';
import {
  FullscreenSheetProvider,
  NowDjingSheet,
  SheetHost,
  useFullscreenSheet,
} from '@/widgets-mobile/partyroom-djing-sheet';
import MobileRoomActionBar from './mobile-room-action-bar.component';

interface Props {
  partyroomId: number;
}

/**
 * 모바일 룸 page-level shell.
 *
 * The reference layout keeps the stage, chat card, and bottom shortcuts in one viewport.
 * FullscreenSheetProvider owns the history-backed Now DJing/search flow while the existing
 * room-tabs widgets remain available to their isolated consumers and tests.
 */
const MobileRoom: FC<Props> = ({ partyroomId }) => (
  <FullscreenSheetProvider>
    <MobileRoomContent partyroomId={partyroomId} />
    <SheetHost />
  </FullscreenSheetProvider>
);

const MobileRoomContent: FC<Props> = ({ partyroomId }) => {
  const t = useI18n();
  const router = useRouter();
  const isGuest = useIsGuest();
  const informSocialType = useInformSocialType();
  const { openDialog } = useDialog();
  const { data: partyroomSummary } = useFetchPartyroomDetailSummary(partyroomId, !!partyroomId);
  const sharePartyroom = useSharePartyroom(partyroomSummary);
  const { push } = useFullscreenSheet();
  const openPlaylists = useOpenPlaylistsManagement();
  const [chatExpanded, setChatExpanded] = useState(false);
  const [stageHeight, setStageHeight] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const observer = new ResizeObserver(([entry]) => {
      setStageHeight(Math.ceil(entry.contentRect.height));
    });
    observer.observe(stage);

    return () => observer.disconnect();
  }, []);

  const openNowDjing = () => {
    push({
      key: 'now-djing',
      title: t.dj.title.current_dj,
      node: <NowDjingSheet partyroomId={partyroomId} />,
    });
  };

  const openProfile = async () => {
    if (await isGuest()) {
      informSocialType();
      return;
    }

    openDialog(() => ({
      title: ({ defaultClassName }) => (
        <Typography type='title2' className={defaultClassName}>
          {t.common.btn.my_profile}
        </Typography>
      ),
      titleAlign: 'left',
      showCloseIcon: true,
      fullScreen: true,
      Body: <ProfileEditFormV2 onClickAvatarSetting={() => router.push('/settings/avatar')} />,
    }));
  };

  return (
    <main className='relative flex min-h-[100dvh] flex-col overflow-hidden bg-black bg-partyRoom bg-cover bg-[position:16%_center] tablet:bg-center'>
      <div className='absolute inset-0 bg-black/45' />
      <div className='relative z-10 flex h-[100dvh] min-h-0 flex-1 flex-col overflow-hidden'>
        <div
          ref={stageRef}
          data-testid='mobile-partyroom-stage'
          className='relative z-10 w-full shrink-0'
        >
          <MobilePartyroomDisplayBoard partyroomId={partyroomId} chatExpanded={chatExpanded} />
        </div>
        <MobilePartyroomChatPanel
          overlay
          expanded={chatExpanded}
          expandedTop={stageHeight + 16}
          onExpandedChange={setChatExpanded}
        />
        {!chatExpanded && (
          <MobileRoomActionBar
            onOpenQueue={openNowDjing}
            onOpenPlaylists={openPlaylists}
            onOpenProfile={openProfile}
            onShare={sharePartyroom}
          />
        )}
      </div>
    </main>
  );
};

export default MobileRoom;
