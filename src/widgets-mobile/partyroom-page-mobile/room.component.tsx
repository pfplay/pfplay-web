'use client';

import { FC } from 'react';
import { MobilePartyroomDisplayBoard } from '@/widgets-mobile/partyroom-display-board';
import { MobilePartyroomRoomTabs } from '@/widgets-mobile/partyroom-room-tabs';

interface Props {
  partyroomId: number;
}

/**
 * 모바일 룸 page-level shell (§4.2 베이스 + 채팅·크루 탭).
 *
 * chunk 4 (현 단계):
 * - display-board (sticky now-playing + YoutubePlayer + 리액션 + 헤더) 그대로
 * - 탭 컨테이너 (채팅 / 크루 / 큐) — 큐 탭은 `MobilePartyroomQueuePanel` (DJ 큐 + 등록·변경·해제)
 * - 탭바 🎧 N 카운트 활성화 (room-tabs 가 useFetchDjingQueue 직접 호출)
 *
 * enter/teardown 효과는 `(room)/[id]/layout.tsx` 가 device 무관 처리.
 */
const MobileRoom: FC<Props> = ({ partyroomId }) => {
  return (
    <main className='min-h-screen bg-black flex flex-col'>
      <MobilePartyroomDisplayBoard partyroomId={partyroomId} />
      <MobilePartyroomRoomTabs partyroomId={partyroomId} />
    </main>
  );
};

export default MobileRoom;
