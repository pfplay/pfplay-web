'use client';

import { useEffect, useState } from 'react';
import ChatTabPanel from '@/app/parties/(room)/[id]/_panels/chat-tab-panel.component';
import CinemaDetailPanel from '@/app/parties/(room)/[id]/_panels/cinema-detail-panel.component';
import CinemaPlaylistPanel from '@/app/parties/(room)/[id]/_panels/cinema-playlist-panel.component';
import { useCurrentPartyroomAlerts } from '@/entities/current-partyroom';
import { useSuspenseFetchMe, useIsGuest } from '@/entities/me';
import { ProfileEditFormV2 } from '@/features/edit-profile-bio';
import { useFetchPartyroomDetailSummary } from '@/features/partyroom/get-summary';
import { useSharePartyroom } from '@/features/partyroom/share-link';
import { useInformSocialType } from '@/features/sign-in/by-social';
import { cn } from '@/shared/lib/functions/cn';
import { useDisclosure } from '@/shared/lib/hooks/use-disclosure.hook';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { Button } from '@/shared/ui/components/button';
import { useDialog } from '@/shared/ui/components/dialog';
import Profile from '@/shared/ui/components/profile/profile.component';
import { Typography } from '@/shared/ui/components/typography';
import { PFDj, PFHeadset, PFInfoOutline, PFLink } from '@/shared/ui/icons';
import { PartyroomAvatars } from '@/widgets/partyroom-avatars';
import { PartyroomDetailTrigger } from '@/widgets/partyroom-detail';
import { PartyroomDisplayBoard } from '@/widgets/partyroom-display-board';
import { DjingDialog } from '@/widgets/partyroom-djing-dialog';
import { useOpenEditProfileAvatarDialog } from '@/widgets/partyroom-edit-profile-avatar-dialog';
import { PartyRoomListTrigger } from '@/widgets/partyroom-party-list';
import { Sidebar } from '@/widgets/sidebar';
import {
  computeDisplayBoardLayout,
  DEFAULT_BOARD_WIDTH,
  RIGHT_PANEL_WIDTH,
} from './compute-display-board-layout';
import { DesktopOverlays } from './desktop-overlays.component';

type Props = {
  partyroomId: number;
};

/**
 * 데스크탑 룸 페이지 본문.
 *
 * 기존: `src/app/parties/(room)/[id]/page.tsx` body (params.id → partyroomId prop)
 * + `(room)/[id]/layout.tsx` 의 main bg 이미지 wrapper
 * + DesktopOverlays.
 *
 * 모바일 트리는 별도(`widgets-mobile/partyroom-page-mobile/room`, chunk 2).
 */
export const DesktopRoom = ({ partyroomId }: Props) => {
  const t = useI18n();
  const {
    open: isDjingDialogOpen,
    onOpen: openDjingDialog,
    onClose: closeDjingDialog,
  } = useDisclosure();

  const isGuest = useIsGuest();
  const informSocialType = useInformSocialType();
  const { data: me } = useSuspenseFetchMe();

  const { data: partyroomSummary, isLoading: isPartyroomSummaryLoading } =
    useFetchPartyroomDetailSummary(partyroomId, !!partyroomId);
  const sharePartyroom = useSharePartyroom(partyroomSummary);

  const openEditProfileAvatarDialog = useOpenEditProfileAvatarDialog();
  const { openDialog } = useDialog();
  const { useUIState } = useStores();
  const cinemaView = useUIState((state) => state.cinemaView);
  const cinemaChatOpen = useUIState((state) => state.cinemaChatOpen);
  const cinemaSidePanel = useUIState((state) => state.cinemaSidePanel);
  const setCinemaSidePanel = useUIState((state) => state.setCinemaSidePanel);

  const [boardWidth, setBoardWidth] = useState(DEFAULT_BOARD_WIDTH);
  const [boardRightOffset, setBoardRightOffset] = useState(RIGHT_PANEL_WIDTH);

  useEffect(() => {
    const computeLayout = () => {
      if (cinemaView) {
        setBoardWidth(window.innerWidth - 400 - 80);
        return;
      }
      const layout = computeDisplayBoardLayout(window.innerWidth);
      setBoardWidth(layout.boardWidth);
      setBoardRightOffset(layout.rightOffset);
    };
    computeLayout();
    window.addEventListener('resize', computeLayout);
    return () => window.removeEventListener('resize', computeLayout);
  }, [cinemaView]);

  useCurrentPartyroomAlerts();

  const toggleSidePanel = (panel: 'detail' | 'playlist') => {
    setCinemaSidePanel(cinemaSidePanel === panel ? 'none' : panel);
  };

  const handleClickProfileButton = async () => {
    if (await isGuest()) {
      informSocialType();
      return;
    }
    openDialog((_, onCancel) => ({
      title: ({ defaultClassName }) => (
        <Typography type='title2' className={defaultClassName}>
          {t.common.btn.my_profile}
        </Typography>
      ),
      titleAlign: 'left',
      showCloseIcon: true,
      classNames: {
        container: 'w-[620px] h-[391px] py-7 px-10 bg-black',
      },
      Body: (
        <ProfileEditFormV2
          onClickAvatarSetting={async () => {
            openEditProfileAvatarDialog();
            onCancel?.();
          }}
        />
      ),
    }));
  };

  /** Cinema header: sidebar action buttons (profile, headset, dj, link) */
  const sidebarActions = (
    <div className='flex items-center gap-4'>
      <button onClick={handleClickProfileButton} className='relative size-9 cursor-pointer'>
        <Profile size={36} src={me.avatarIconUri} />
      </button>
      <button
        onClick={() => cinemaView && toggleSidePanel('playlist')}
        className={cn(
          'flex items-center justify-center rounded-lg size-9 transition-colors',
          cinemaView && cinemaSidePanel === 'playlist'
            ? 'bg-gray-600'
            : 'bg-gray-800 hover:bg-gray-700'
        )}
        title={t.common.btn.playlist}
      >
        <PFHeadset width={24} height={24} className='[&_*]:fill-gray-400' />
      </button>
      <button
        onClick={async () => {
          if (await isGuest()) {
            informSocialType();
            return;
          }
          openDjingDialog();
        }}
        className='bg-gray-800 flex items-center justify-center rounded-lg size-9 hover:bg-gray-700 transition-colors'
        title={t.dj.title.dj_queue}
      >
        <PFDj width={24} height={24} className='text-gray-400' />
      </button>
      <button
        onClick={sharePartyroom}
        disabled={isPartyroomSummaryLoading}
        className='bg-gray-800 flex items-center justify-center rounded-lg size-9 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        title={t.common.btn.share}
      >
        <PFLink width={24} height={24} className='text-gray-400' />
      </button>
    </div>
  );

  /** Cinema header: right-side action buttons */
  const headerActions = (
    <div className='flex items-center gap-3'>
      {cinemaView ? (
        <Button
          color='secondary'
          variant='outline'
          Icon={<PFInfoOutline width={20} height={20} className='[&_*]:stroke-white' />}
          size='sm'
          className='text-gray-50 w-full'
          onClick={() => toggleSidePanel('detail')}
        >
          {t.party.title.party_info}
        </Button>
      ) : (
        <PartyroomDetailTrigger />
      )}
      <PartyRoomListTrigger />
    </div>
  );

  /** Cinema side panel content */
  const sidePanelContent =
    cinemaSidePanel === 'detail' ? (
      <CinemaDetailPanel onClose={() => setCinemaSidePanel('none')} />
    ) : cinemaSidePanel === 'playlist' ? (
      <CinemaPlaylistPanel onClose={() => setCinemaSidePanel('none')} />
    ) : undefined;

  /** Cinema chat panel — rendered as right column inside the overlay (video+footer shrink left) */
  const chatPanelContent = cinemaChatOpen ? (
    <ChatTabPanel className='pt-5 px-5 pb-3 min-h-0' />
  ) : undefined;

  // TODO: 파티룸 모든 api 불러오는 동안 Suspense로 입장 중 페이지 보여주기
  return (
    <main className='bg-partyRoom bg-left-bottom overflow-hidden'>
      <PartyroomAvatars />

      {/* 가운데 전광판 */}
      <div
        className={
          cinemaView
            ? 'absolute top-[44px] left-0 right-[400px] px-[40px]'
            : 'absolute top-[44px] px-[40px]'
        }
        style={cinemaView ? undefined : { right: boardRightOffset }}
      >
        <PartyroomDisplayBoard
          width={boardWidth}
          cinemaView={cinemaView}
          headerActions={headerActions}
          sidebarActions={sidebarActions}
          sidePanelContent={sidePanelContent}
          chatPanelContent={chatPanelContent}
        />
      </div>

      {/* 왼쪽 float 메뉴 */}
      <Sidebar
        className={cn([
          'flexCol justify-between gap-10 px-1 py-6 bg-[#0E0E0E] rounded',
          'absolute top-1/2 left-[40px] transform -translate-y-1/2',
          cinemaView && 'hidden',
        ])}
        extraButtons={[
          {
            onClick: async () => {
              if (await isGuest()) {
                informSocialType();
                return;
              }
              openDjingDialog();
            },
            icon: (size, className) => <PFDj width={size} height={size} className={className} />,
            text: t.dj.title.dj_queue,
            testId: 'dj-queue-button',
          },
          {
            onClick: sharePartyroom,
            icon: (size, className) => <PFLink width={size} height={size} className={className} />,
            text: t.common.btn.share,
            disabled: isPartyroomSummaryLoading,
          },
        ]}
        onClickAvatarSetting={openEditProfileAvatarDialog}
      />

      {/* 오른쪽 채팅창 — cinema 모드에서는 overlay 내부에서 관리하므로 숨김 */}
      <div
        className={cn(
          'absolute top-0 right-0 w-[400px] max-w-full h-screen flexCol bg-black pt-8 pb-3 px-7',
          cinemaView && 'hidden'
        )}
      >
        <div className='bg-black grid grid-cols-2 gap-3 mb-5'>
          <PartyroomDetailTrigger />
          <PartyRoomListTrigger />
        </div>

        {/* 채팅, 사람 탭 */}
        <ChatTabPanel />
      </div>

      <DjingDialog partyroomId={partyroomId} open={isDjingDialogOpen} close={closeDjingDialog} />

      <DesktopOverlays />
    </main>
  );
};
