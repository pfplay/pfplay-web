'use client';
import { FC } from 'react';
import { useCurrentPartyroomCrews } from '@/features/partyroom/list-crews';
import { MobilePartyroomChatPanel } from '@/widgets-mobile/partyroom-chat-panel';
import { MobilePartyroomCrewsPanel } from '@/widgets-mobile/partyroom-crews-panel';
import useTabHash from './lib/use-tab-hash.hook';
import QueueTabPlaceholder from './ui/parts/queue-tab-placeholder.component';
import TabBar from './ui/parts/tab-bar.component';

/**
 * 모바일 룸 탭 컨테이너 (§4.2 채팅/크루/큐).
 *
 * 레이아웃:
 * - flex-1 (부모 main 의 1차 grow target)
 * - 세 탭 모두 mount 유지하고 `hidden` 토글 (탭 전환 시 채팅 스크롤·input·메시지 누락 회피)
 * - 활성 탭만 visible + flex layout 작동 (hidden 은 display:none → flex 무효)
 * - 탭바는 nav sibling (sticky bottom 안 함 — 부모가 flex 라 자연스럽게 bottom)
 */
const MobilePartyroomRoomTabs: FC = () => {
  const { activeTab, setActiveTab } = useTabHash();
  const crews = useCurrentPartyroomCrews();

  return (
    <div className='flex-1 flex flex-col min-h-0'>
      <div className='flex-1 min-h-0 relative'>
        <div
          data-tab-content='chat'
          hidden={activeTab !== 'chat'}
          className='absolute inset-0 flex flex-col'
        >
          <MobilePartyroomChatPanel />
        </div>
        <div
          data-tab-content='crew'
          hidden={activeTab !== 'crew'}
          className='absolute inset-0 overflow-y-auto'
        >
          <MobilePartyroomCrewsPanel />
        </div>
        <div data-tab-content='queue' hidden={activeTab !== 'queue'} className='absolute inset-0'>
          <QueueTabPlaceholder />
        </div>
      </div>
      <TabBar activeTab={activeTab} crewCount={crews.length} onTabClick={setActiveTab} />
    </div>
  );
};

export default MobilePartyroomRoomTabs;
