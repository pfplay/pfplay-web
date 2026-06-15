'use client';
import { FC } from 'react';
import { useCurrentPartyroomCrews } from '@/features/partyroom/list-crews';
import { useFetchDjingQueue } from '@/features/partyroom/list-djing-queue';
import { cn } from '@/shared/lib/functions/cn';
import { MobilePartyroomChatPanel } from '@/widgets-mobile/partyroom-chat-panel';
import { MobilePartyroomCrewsPanel } from '@/widgets-mobile/partyroom-crews-panel';
import { MobilePartyroomQueuePanel } from '@/widgets-mobile/partyroom-queue-panel';
import { TabKey } from './lib/use-tab-hash.hook';
import TabBar from './ui/parts/tab-bar.component';

interface Props {
  partyroomId: number;
  /** 탭 상태는 셸(room.component)이 useTabHash 로 소유하고 내려준다 (single source). */
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
}

/**
 * 모바일 룸 탭 컨테이너 (§4.2 채팅/크루/큐).
 *
 * 레이아웃:
 * - flex-1 (부모 main 의 1차 grow target)
 * - 세 탭 모두 mount 유지하고 `hidden` 토글 (탭 전환 시 채팅 스크롤·input·메시지 누락 회피)
 * - 비활성 탭은 utility `hidden` class 로 display:none 강제. HTML `hidden` attribute 만으로는
 *   `.flex { display: flex }` 와 specificity 동률이라 utility 가 이기지 못해 겹쳐 보이는 회귀가
 *   있었음 (탭 전환 시 채팅 패널이 다른 탭 위로 비치는 버그). cn = twMerge 가 `flex` ↔ `hidden`
 *   충돌을 해결하여 `display: none` 가 적용됨. HTML `hidden` 도 함께 유지 (a11y / 보조기술).
 * - 탭바는 nav sibling (sticky bottom 안 함 — 부모가 flex 라 자연스럽게 bottom)
 *
 * chunk 4:
 * - 큐 탭 placeholder → MobilePartyroomQueuePanel 교체
 * - 탭바 🎧 N 카운트 활성화 (useFetchDjingQueue.djs.length)
 */
const MobilePartyroomRoomTabs: FC<Props> = ({ partyroomId, activeTab, setActiveTab }) => {
  const crews = useCurrentPartyroomCrews();
  const { data: djingQueue } = useFetchDjingQueue({ partyroomId });
  const queueCount = djingQueue?.djs?.length ?? 0;

  return (
    <div className='flex-1 flex flex-col min-h-0'>
      <div className='flex-1 min-h-0 relative'>
        <div
          data-tab-content='chat'
          hidden={activeTab !== 'chat'}
          className={cn('absolute inset-0 flex flex-col', activeTab !== 'chat' && 'hidden')}
        >
          <MobilePartyroomChatPanel />
        </div>
        <div
          data-tab-content='crew'
          hidden={activeTab !== 'crew'}
          className={cn('absolute inset-0 overflow-y-auto', activeTab !== 'crew' && 'hidden')}
        >
          <MobilePartyroomCrewsPanel />
        </div>
        <div
          data-tab-content='queue'
          hidden={activeTab !== 'queue'}
          className={cn('absolute inset-0', activeTab !== 'queue' && 'hidden')}
        >
          <MobilePartyroomQueuePanel partyroomId={partyroomId} />
        </div>
      </div>
      <TabBar
        activeTab={activeTab}
        crewCount={crews.length}
        queueCount={queueCount}
        onTabClick={setActiveTab}
      />
    </div>
  );
};

export default MobilePartyroomRoomTabs;
