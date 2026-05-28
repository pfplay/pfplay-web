'use client';

import { FC } from 'react';
import { MobilePartyroomCrewsPanel } from '@/widgets-mobile/partyroom-crews-panel';
import { MobilePartyroomDisplayBoard } from '@/widgets-mobile/partyroom-display-board';

interface Props {
  partyroomId: number;
}

/**
 * 모바일 룸 page-level shell (§4.2 베이스).
 *
 * 본 chunk 2 의 prod 상태:
 * - display-board = 헤더(뒤로·룸이름·⋮) + sticky now-playing + YoutubePlayer 오디오 + 리액션
 * - 크루 패널 직접 노출 (scroll container 안에 sticky-top 헤더 가짐, display-board sticky 와 무충돌)
 *
 * Deferred (chunk 3·4):
 * - 탭바 (채팅/크루/큐)
 * - 채팅 패널
 * - DJ 큐 패널
 *
 * enter/teardown 효과는 `(room)/[id]/layout.tsx` 가 device 무관 처리.
 */
const MobileRoom: FC<Props> = ({ partyroomId }) => {
  return (
    <main className='min-h-screen bg-black flex flex-col'>
      <MobilePartyroomDisplayBoard partyroomId={partyroomId} />
      <div className='flex-1 overflow-y-auto'>
        <MobilePartyroomCrewsPanel />
        {/* chunk 3: 탭바 + 채팅 패널 wiring */}
        {/* chunk 4: DJ 큐 패널 wiring */}
      </div>
    </main>
  );
};

export default MobileRoom;
