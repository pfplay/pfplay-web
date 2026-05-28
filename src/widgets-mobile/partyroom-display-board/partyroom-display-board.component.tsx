'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { useFetchPartyroomDetailSummary } from '@/features/partyroom/get-summary';
import { cn } from '@/shared/lib/functions/cn';
import { useStores } from '@/shared/lib/store/stores.context';
import ActionButtons from './ui/parts/action-buttons.component';

// 데스크탑 video.component.tsx 와 동일 패턴 — react-player/youtube 를 SSR off 로 동적 import.
// C3 격리: 데스크탑 module-private const 를 import 하지 않고 자체 mount.
const YoutubePlayer = dynamic(() => import('react-player/youtube'), { ssr: false });

interface Props {
  partyroomId: number;
}

/**
 * 모바일 전광판 (§4.2):
 * - sticky top — 헤더 + now-playing + 리액션 inline 한 묶음
 * - YoutubePlayer 1px hidden mount — **오디오 재생** (모바일 청취 핵심)
 * - 리액션 inline (플로팅 X — 채팅·키보드 충돌 회피)
 *
 * 룸 이름은 store 에 없으므로 `useFetchPartyroomDetailSummary` 로 fetch
 * (데스크탑 룸도 동일 패턴).
 *
 * Header (룸이름·뒤로·⋮ 메뉴) 는 본 컴포넌트 안에서 직접 렌더 — page.tsx 는 모바일
 * 룸에서 글로벌 `<Header />` 미렌더. ⋮ 메뉴 확장은 chunk 3·4.
 *
 * autoplay 정책 / gesture gate / seekToLive 는 chunk 후속 polish 대상 — chunk 2 는
 * 입장 시(=user gesture 직후) 자동재생 케이스만 커버.
 */
const MobilePartyroomDisplayBoard: FC<Props> = ({ partyroomId }) => {
  const router = useRouter();
  const { useCurrentPartyroom } = useStores();
  const playbackActivated = useCurrentPartyroom((state) => state.playbackActivated);
  const playback = useCurrentPartyroom((state) => state.playback);
  const currentDj = useCurrentPartyroom((state) => state.currentDj);
  const crews = useCurrentPartyroom((state) => state.crews);
  const { data: detailSummary } = useFetchPartyroomDetailSummary(partyroomId, true);
  const partyroomTitle = detailSummary?.title ?? '';

  const currentDjNickname = currentDj
    ? (crews.find((c) => c.crewId === currentDj.crewId)?.nickname ?? null)
    : null;

  return (
    <div className={cn('sticky top-0 z-20 w-full bg-black border-b border-gray-800')}>
      {/* 헤더 row: 뒤로 · 룸 이름 · ⋮ (⋮ 메뉴는 chunk 3·4 에 확장) */}
      <header className='flex items-center justify-between px-4 h-12'>
        <button
          aria-label='뒤로'
          className='w-11 h-11 flex items-center justify-center text-gray-300'
          onClick={() => router.push('/parties')}
        >
          ←
        </button>
        <h1 className='flex-1 text-center text-base font-semibold text-white truncate px-2'>
          {partyroomTitle}
        </h1>
        <button
          aria-label='메뉴'
          className='w-11 h-11 flex items-center justify-center text-gray-300'
        >
          ⋮
        </button>
      </header>

      {/* now-playing + 리액션 */}
      <div className='px-4 py-3 space-y-3'>
        {playbackActivated && playback ? (
          <>
            <p className='text-base font-semibold text-white truncate'>{playback.name}</p>
            {currentDjNickname && <p className='text-xs text-gray-500'>🎧 {currentDjNickname}</p>}
            <p className='text-xs text-gray-600'>{playback.duration}</p>
          </>
        ) : (
          <p className='text-sm text-gray-500'>지금 재생 중인 곡이 없어요</p>
        )}

        <div className='flex gap-2'>
          <ActionButtons />
        </div>
      </div>

      {/* YoutubePlayer = 오디오 mount. 1px hidden 으로 화면 차지 X */}
      {playbackActivated && playback?.linkId && (
        <div
          aria-hidden
          className='absolute pointer-events-none w-px h-px overflow-hidden opacity-0 -z-10'
        >
          <YoutubePlayer
            url={`https://www.youtube.com/watch?v=${playback.linkId}`}
            playing={playbackActivated}
            muted={false}
            volume={1}
            width='1px'
            height='1px'
          />
        </div>
      )}
    </div>
  );
};

export default MobilePartyroomDisplayBoard;
