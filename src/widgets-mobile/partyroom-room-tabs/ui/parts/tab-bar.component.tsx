'use client';
import { FC } from 'react';
import { cn } from '@/shared/lib/functions/cn';
import { TabKey } from '../../lib/use-tab-hash.hook';

interface Props {
  activeTab: TabKey;
  crewCount: number;
  onTabClick: (tab: TabKey) => void;
}

/**
 * 모바일 룸 탭바 (§4.2 ASCII 디자인 56px 높이).
 *
 * - 3 버튼: 💬 채팅 · 👥 N · 🎧 큐 (chunk 4 에서 큐 카운트 추가, 본 chunk 는 라벨만)
 * - 활성 탭 = bg-gray-900 + text-white, 비활성 = text-gray-400
 * - 터치 타겟 min-h-[44px] (iOS HIG, spec §4.1)
 * - safe-area-inset-bottom 은 본 탭바 자체 padding 으로 흡수
 * - 라벨은 inline 한글 (chunk 2 의 "{N}명 청취 중" 과 동일 정책, v1 다국어화 OUT)
 */
const TabBar: FC<Props> = ({ activeTab, crewCount, onTabClick }) => {
  return (
    <nav
      className={cn(
        'shrink-0 grid grid-cols-3 bg-black border-t border-gray-800',
        'pb-[env(safe-area-inset-bottom)]'
      )}
      role='tablist'
      aria-label='파티룸 탭'
    >
      <TabButton
        testId='mobile-tab-chat'
        active={activeTab === 'chat'}
        label='💬 채팅'
        onClick={() => onTabClick('chat')}
      />
      <TabButton
        testId='mobile-tab-crew'
        active={activeTab === 'crew'}
        label={`👥 ${crewCount}`}
        onClick={() => onTabClick('crew')}
      />
      <TabButton
        testId='mobile-tab-queue'
        active={activeTab === 'queue'}
        label='🎧 큐'
        onClick={() => onTabClick('queue')}
      />
    </nav>
  );
};

interface TabButtonProps {
  testId: string;
  active: boolean;
  label: string;
  onClick: () => void;
}

const TabButton: FC<TabButtonProps> = ({ testId, active, label, onClick }) => (
  <button
    type='button'
    data-testid={testId}
    role='tab'
    aria-selected={active}
    className={cn(
      'min-h-[44px] py-3 text-sm font-medium',
      active ? 'bg-gray-900 text-white' : 'text-gray-400'
    )}
    onClick={onClick}
  >
    {label}
  </button>
);

export default TabBar;
