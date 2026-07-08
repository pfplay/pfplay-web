'use client';

import { useRouter } from 'next/navigation';
import { FC, useRef } from 'react';
import type TReactPlayer from 'react-player';
import { useFetchPartyroomDetailSummary } from '@/features/partyroom/get-summary';
import { cn } from '@/shared/lib/functions/cn';
import { useStores } from '@/shared/lib/store/stores.context';
import { MobileSheetHeader } from '@/shared/ui/components/mobile-sheet-header';
import { PFArrowLeft, PFMoreVert } from '@/shared/ui/icons';
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
}

/**
 * 모바일 전광판 — chunk 3.1 재설계 (spec §4.2 / §6.*), issue #420 ToS 최소 크기 준수.
 *
 * 본 컴포넌트 책임:
 * 1. useAutoplayGestureGate 호출 — VideoFrame overlay 에 gate state 주입
 *    (§4.4 / §6.5.2 single source of truth).
 * 2. NowPlayingRow (min-h-[44px]) 로 NowPlayingMeta 표시.
 *
 * 데스크탑 widgets/partyroom-display-board 는 0 수정 (§3 row 9).
 */
const MobilePartyroomDisplayBoard: FC<Props> = ({ partyroomId, compact = false }) => {
  const router = useRouter();
  const { useCurrentPartyroom } = useStores();
  const playbackActivated = useCurrentPartyroom((state) => state.playbackActivated);
  const playback = useCurrentPartyroom((state) => state.playback);
  const currentDj = useCurrentPartyroom((state) => state.currentDj);
  const crews = useCurrentPartyroom((state) => state.crews);
  // 두번째 arg = chunk 2 의 기존 시그니처 그대로 유지 (suspense/enabled flag, 데스크탑 룸 동일 패턴).
  const { data: detailSummary } = useFetchPartyroomDetailSummary(partyroomId, true);
  const partyroomTitle = detailSummary?.title ?? '';

  const currentDjNickname = currentDj
    ? (crews.find((c) => c.crewId === currentDj.crewId)?.nickname ?? null)
    : null;

  const playerRef = useRef<TReactPlayer | null>(null);

  const videoId = playbackActivated ? (playback?.linkId ?? null) : null;
  const isPlaying = videoId !== null;

  const gate = useAutoplayGestureGate({ playerRef, playable: isPlaying, videoId });

  return (
    <div className={cn('sticky top-0 z-20 w-full bg-black border-b border-gray-800')}>
      <MobileSheetHeader
        title={partyroomTitle}
        leading={
          <button
            type='button'
            aria-label='뒤로'
            className='w-10 h-10 flex items-center justify-center text-gray-300'
            onClick={() => router.push('/parties')}
          >
            <PFArrowLeft width={24} height={24} />
          </button>
        }
        trailing={
          <button
            type='button'
            aria-label='메뉴'
            className='w-10 h-10 flex items-center justify-center text-gray-300'
          >
            <PFMoreVert width={24} height={24} />
          </button>
        }
      />

      <div className='px-4 pt-3'>
        <VideoFrame videoId={videoId} playerRef={playerRef} gate={gate} playback={playback} />
      </div>

      {isPlaying && playback && (
        <div
          data-testid='now-playing-row'
          className='flex items-center min-h-[44px] px-4 pt-3 gap-3'
        >
          <div className='w-full'>
            <NowPlayingMeta
              trackName={playback.name}
              djNickname={currentDjNickname}
              duration={playback.duration}
            />
          </div>
        </div>
      )}

      {/* 리액션은 채팅 맥락 전용 — 크루/큐(관리) 탭에서는 숨겨 세로 공간을 양보. */}
      {!compact && (
        <div className='flex justify-center gap-3 px-4 py-3'>
          <ActionButtons />
        </div>
      )}
    </div>
  );
};

export default MobilePartyroomDisplayBoard;
