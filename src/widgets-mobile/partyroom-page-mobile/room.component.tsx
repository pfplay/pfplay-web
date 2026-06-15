'use client';

import { FC } from 'react';
import { MobilePartyroomDisplayBoard } from '@/widgets-mobile/partyroom-display-board';
import { MobilePartyroomRoomTabs, useTabHash } from '@/widgets-mobile/partyroom-room-tabs';

interface Props {
  partyroomId: number;
}

/**
 * 모바일 룸 page-level shell (§4.2 베이스 + 채팅·크루 탭).
 *
 * chunk 4 (현 단계):
 * - display-board (sticky now-playing + YoutubePlayer + 리액션 + 헤더)
 * - 탭 컨테이너 (채팅 / 크루 / 큐) — 큐 탭은 `MobilePartyroomQueuePanel` (DJ 큐 + 등록·변경·해제)
 * - 탭바 🎧 N 카운트 활성화 (room-tabs 가 useFetchDjingQueue 직접 호출)
 *
 * 탭 상태 single source: `useTabHash` 를 셸에서 1회 호출해 display-board + tabs 로 분배.
 * (각자 호출하면 setActiveTab 의 pushState 가 hashchange 를 발화하지 않아 두 인스턴스가 어긋남.)
 * display-board 는 탭을 직접 모르고, 관리 탭(크루/큐)에서 영상 축소·리액션 숨김을 위한
 * `compact` 불리언만 받는다.
 *
 * enter/teardown 효과는 `(room)/[id]/layout.tsx` 가 device 무관 처리.
 */
const MobileRoom: FC<Props> = ({ partyroomId }) => {
  const { activeTab, setActiveTab } = useTabHash();
  // 크루/큐 = 관리 맥락 → 디스플레이 보드를 compact 로 (리액션 숨김 + 영상 자동 축소).
  const compact = activeTab !== 'chat';

  return (
    <main className='min-h-screen bg-black flex flex-col'>
      <MobilePartyroomDisplayBoard partyroomId={partyroomId} compact={compact} />
      <MobilePartyroomRoomTabs
        partyroomId={partyroomId}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </main>
  );
};

export default MobileRoom;
