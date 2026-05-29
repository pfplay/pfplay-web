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
 * 본 chunk 3 의 prod 상태:
 * - display-board (sticky now-playing + YoutubePlayer + 리액션 + 헤더) 그대로
 * - 탭 컨테이너 (채팅 / 크루 / 큐 placeholder) 로 chunk 2 의 `MobilePartyroomCrewsPanel`
 *   직접 노출을 교체. 크루 탭이 그 컴포넌트를 mount.
 *
 * Deferred (chunk 4):
 * - 큐 탭 placeholder 를 실 DJ 큐 콘텐츠로 교체 + 탭바 큐 카운트 활성화
 *
 * enter/teardown 효과는 `(room)/[id]/layout.tsx` 가 device 무관 처리.
 */
const MobileRoom: FC<Props> = ({ partyroomId }) => {
  return (
    <main className='min-h-screen bg-black flex flex-col'>
      <MobilePartyroomDisplayBoard partyroomId={partyroomId} />
      <MobilePartyroomRoomTabs />
    </main>
  );
};

export default MobileRoom;
