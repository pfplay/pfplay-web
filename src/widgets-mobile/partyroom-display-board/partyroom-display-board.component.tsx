'use client';

import { useRouter } from 'next/navigation';
import { FC, useRef, useState } from 'react';
import type TReactPlayer from 'react-player';
import { useFetchPartyroomDetailSummary } from '@/features/partyroom/get-summary';
import {
  isEmergencyBanner,
  isPlannedNotice,
  isToast,
} from '@/features/system-announcement/lib/announcement-helpers';
import { useSystemAnnouncementStore } from '@/features/system-announcement/model/system-announcement.store';
import EmergencyBanner from '@/features/system-announcement/ui/emergency-banner';
import EventToast from '@/features/system-announcement/ui/event-toast';
import MaintenancePlannedBanner from '@/features/system-announcement/ui/maintenance-planned-banner';
import { cn } from '@/shared/lib/functions/cn';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { MobileSheetHeader } from '@/shared/ui/components/mobile-sheet-header';
import { PFCampaign, PFArrowLeft, PFPersonOutline } from '@/shared/ui/icons';
import useAutoplayGestureGate from './lib/use-autoplay-gesture-gate.hook';
import ActionButtons from './ui/parts/action-buttons.component';
import NowPlayingMeta from './ui/parts/now-playing-meta.component';
import VideoFrame from './ui/parts/video-frame.component';

interface Props {
  partyroomId: number;
  /**
   * compact = 관리 탭(크루/큐) 표시 모드. 리액션 버튼을 숨겨 아래 탭 목록(크루/DJ 큐)에
   * 세로 공간을 양보한다. 채팅 탭은 false(리액션 노출).
   *
   * ⚠️ 영상은 compact 여부와 무관하게 **항상 전체너비 16:9** 로 표시한다. YouTube ToS
   * (viewport ≥200×200, issue #420) 상 모바일에서 컴플라이언트한 유일한 크기이며, 과거
   * compact 가 영상을 80×45 로 축소하던 동작은 정책 위반이라 제거됨.
   * @default false
   */
  compact?: boolean;
  chatExpanded?: boolean;
}

/**
 * 모바일 전광판 — reference stage shell + issue #420 ToS 최소 크기 준수.
 *
 * 본 컴포넌트 책임:
 * 1. useAutoplayGestureGate 호출 — VideoFrame overlay 에 gate state 주입
 *    (§4.4 / §6.5.2 single source of truth).
 * 2. Reference header/notice/NowPlayingRow 를 overlay stage 안에 표시.
 *
 * 데스크탑 widgets/partyroom-display-board 는 0 수정 (§3 row 9).
 */
const MobilePartyroomDisplayBoard: FC<Props> = ({
  partyroomId,
  compact = false,
  chatExpanded = false,
}) => {
  const router = useRouter();
  const t = useI18n();
  const { useCurrentPartyroom } = useStores();
  const playbackActivated = useCurrentPartyroom((state) => state.playbackActivated);
  const playback = useCurrentPartyroom((state) => state.playback);
  const currentDj = useCurrentPartyroom((state) => state.currentDj);
  const crews = useCurrentPartyroom((state) => state.crews);
  const notice = useCurrentPartyroom((state) => state.notice);
  const announcements = useSystemAnnouncementStore((state) =>
    Array.from(state.announcements.values())
  );
  // 두번째 arg = chunk 2 의 기존 시그니처 그대로 유지 (suspense/enabled flag, 데스크탑 룸 동일 패턴).
  const { data: detailSummary } = useFetchPartyroomDetailSummary(partyroomId, true);
  const partyroomTitle = detailSummary?.title ?? '';

  const currentDjNickname = currentDj
    ? (crews.find((c) => c.crewId === currentDj.crewId)?.nickname ?? null)
    : null;

  const playerRef = useRef<TReactPlayer | null>(null);
  // 공지 본문이 바뀌면 이전 dismiss 를 이어받지 않도록 표시 상태를 새로 시작한다.
  const [dismissedNotice, setDismissedNotice] = useState<string | null>(null);
  const noticeVisible = notice !== dismissedNotice;

  const videoId = playbackActivated ? (playback?.linkId ?? null) : null;
  const isPlaying = videoId !== null;
  const plannedAnnouncements = announcements.filter(isPlannedNotice);
  const emergencyAnnouncements = announcements.filter(isEmergencyBanner);
  const eventAnnouncements = announcements.filter(isToast);

  const gate = useAutoplayGestureGate({ playerRef, playable: isPlaying, videoId });

  return (
    <div className={cn('relative z-10 w-full shrink-0 text-white')}>
      <MobileSheetHeader
        title={partyroomTitle || 'Main Stage'}
        titleType='title2'
        className='h-[120px] border-none px-8 pt-6'
        leading={
          <button
            type='button'
            aria-label={t.common.btn.back}
            className='flex h-10 w-10 items-center justify-center text-gray-100'
            onClick={() => router.push('/parties')}
          >
            <PFArrowLeft width={32} height={32} />
          </button>
        }
        trailing={
          <button
            type='button'
            aria-label={t.common.menu.title}
            className='flex items-center gap-2 text-[20px] font-bold'
          >
            <PFPersonOutline width={28} height={28} className='[&_*]:stroke-gray-400' />
            <span>{crews.length}</span>
          </button>
        }
      />

      {notice && noticeVisible && (
        <div className='mx-4 mt-2 flex min-h-[60px] items-center gap-4 rounded-[6px] bg-gray-900/75 px-4 py-3 backdrop-blur-md'>
          <PFCampaign width={28} height={28} className='shrink-0 [&_*]:fill-gray-50' />
          <p className='flex-1 text-[16px] leading-[1.45] text-gray-50'>{notice}</p>
          <button
            type='button'
            aria-label={`${t.system.announcement.notice.label} ${t.common.btn.close}`}
            className='shrink-0 text-[30px] font-light leading-none text-gray-100'
            onClick={() => setDismissedNotice(notice)}
          >
            ×
          </button>
        </div>
      )}

      {(plannedAnnouncements.length > 0 || emergencyAnnouncements.length > 0) && (
        <div
          data-testid='mobile-system-announcement-top-stack'
          className='mx-4 mt-2 flex flex-col gap-2'
        >
          {plannedAnnouncements.map((announcement) => (
            <MaintenancePlannedBanner key={announcement.announcementId} snapshot={announcement} />
          ))}
          {emergencyAnnouncements.map((announcement) => (
            <EmergencyBanner key={announcement.announcementId} snapshot={announcement} />
          ))}
        </div>
      )}

      {eventAnnouncements.length > 0 && (
        <div
          data-testid='mobile-system-announcement-toast-stack'
          className='mx-4 mt-2 flex flex-col gap-2'
        >
          {eventAnnouncements.map((announcement) => (
            <EventToast
              key={announcement.announcementId}
              snapshot={announcement}
              className='w-full'
            />
          ))}
        </div>
      )}

      <div className='px-4 pt-4'>
        <VideoFrame
          videoId={videoId}
          playerRef={playerRef}
          gate={gate}
          playback={playback}
          showPlaceholder={!chatExpanded}
        />
      </div>

      {isPlaying && playback && !chatExpanded && !compact && (
        <div
          data-testid='now-playing-row'
          className='mx-4 mt-3 rounded-[6px] border border-gray-800 bg-black px-3 py-4'
        >
          <NowPlayingMeta
            trackName={playback.name}
            djNickname={currentDjNickname}
            duration={playback.duration}
            showDetails={false}
          />
          <div className='flex justify-center gap-3 pt-3'>
            <ActionButtons />
          </div>
        </div>
      )}
    </div>
  );
};

export default MobilePartyroomDisplayBoard;
