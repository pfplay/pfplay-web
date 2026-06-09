'use client';

import { useRouter } from 'next/navigation';
import { FC, useRef, useState } from 'react';
import type TReactPlayer from 'react-player';
import { useFetchPartyroomDetailSummary } from '@/features/partyroom/get-summary';
import { cn } from '@/shared/lib/functions/cn';
import { useStores } from '@/shared/lib/store/stores.context';
import { MobileSheetHeader } from '@/shared/ui/components/mobile-sheet-header';
import { PFArrowLeft, PFMoreVert } from '@/shared/ui/icons';
import useAutoplayGestureGate from './lib/use-autoplay-gesture-gate.hook';
import ActionButtons from './ui/parts/action-buttons.component';
import NowPlayingMeta from './ui/parts/now-playing-meta.component';
import TapToPlayButton from './ui/parts/tap-to-play-button.component';
import VideoFrame from './ui/parts/video-frame.component';

interface Props {
  partyroomId: number;
}

/**
 * 모바일 전광판 — chunk 3.1 재설계 (spec §4.2 / §6.*).
 *
 * 본 컴포넌트 책임:
 * 1. expanded state owner (룸 mount 시 true, 토글 클릭만 변경).
 * 2. useAutoplayGestureGate 호출 — VideoFrame overlay 와 NowPlayingRow TapToPlayButton
 *    양쪽에 동일 gate state 주입 (§4.4 / §6.5.2 single source of truth).
 * 3. NowPlayingRow (min-h-[44px]) 로 NowPlayingMeta + TapToPlayButton 같은 row wrap
 *    → TapToPlayButton 의 iOS HIG 44x44 hit-area 확보 (§6.4 reviewer 3차 #2).
 *
 * 데스크탑 widgets/partyroom-display-board 는 0 수정 (§3 row 9).
 */
const MobilePartyroomDisplayBoard: FC<Props> = ({ partyroomId }) => {
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

  const [expanded, setExpanded] = useState(true);
  const playerRef = useRef<TReactPlayer | null>(null);

  const videoId = playbackActivated ? (playback?.linkId ?? null) : null;
  const isPlaying = videoId !== null;
  const mode: 'A' | 'B' | 'C' = !isPlaying ? 'C' : expanded ? 'A' : 'B';

  const gate = useAutoplayGestureGate({ playerRef, playable: isPlaying, videoId });

  // TapToPlayButton 합성 prop: AutoplayGestureGate visible 조건과 동일 (single source).
  const tapToPlayVisible = gate.autoplayBlocked && !gate.played;

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
        <VideoFrame
          videoId={videoId}
          expanded={expanded}
          onToggleExpand={() => setExpanded((v) => !v)}
          playerRef={playerRef}
          gate={gate}
          playback={playback}
        />
      </div>

      {mode !== 'C' && playback && (
        <div
          data-testid='now-playing-row'
          className='flex items-center min-h-[44px] px-4 pt-3 gap-3'
        >
          <div className={mode === 'A' ? 'w-full' : 'flex-1 min-w-0'}>
            <NowPlayingMeta
              layout={mode === 'A' ? 'column' : 'row'}
              trackName={playback.name}
              djNickname={currentDjNickname}
              duration={playback.duration}
            />
          </div>
          {mode === 'B' && (
            <TapToPlayButton autoplayBlocked={tapToPlayVisible} onTap={gate.handleGesturePlay} />
          )}
        </div>
      )}

      <div className='flex gap-2 px-4 py-3'>
        <ActionButtons />
      </div>
    </div>
  );
};

export default MobilePartyroomDisplayBoard;
