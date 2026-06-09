'use client';
import { FC, ReactNode } from 'react';
import { cn } from '@/shared/lib/functions/cn';
import { Typography } from '@/shared/ui/components/typography';
import {
  PFChatFilled,
  PFChatOutline,
  PFPersonFilled,
  PFPersonOutline,
  PFHeadset,
} from '@/shared/ui/icons';
import { TabKey } from '../../lib/use-tab-hash.hook';

interface Props {
  activeTab: TabKey;
  crewCount: number;
  queueCount: number;
  onTabClick: (tab: TabKey) => void;
}

/**
 * 모바일 룸 탭바 — PF 아이콘 + Typography, 활성 탭 = 레드 강조 + 상단 언더라인.
 *
 * - 3 버튼: 채팅(Chat) · 크루 인원 N · DJ 큐 N
 * - 활성 = text-red-400 + border-t-2 border-red-400, 비활성 = text-gray-400
 * - 터치 타겟 min-h-[44px] (iOS HIG, spec §4.1)
 * - safe-area-inset-bottom 은 본 탭바 자체 padding 으로 흡수
 */
const TabBar: FC<Props> = ({ activeTab, crewCount, queueCount, onTabClick }) => (
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
      ariaLabel='채팅'
      icon={
        activeTab === 'chat' ? (
          <PFChatFilled width={20} height={20} aria-hidden='true' />
        ) : (
          <PFChatOutline width={20} height={20} aria-hidden='true' />
        )
      }
      text='채팅'
      onClick={() => onTabClick('chat')}
    />
    <TabButton
      testId='mobile-tab-crew'
      active={activeTab === 'crew'}
      ariaLabel={`크루 ${crewCount}`}
      icon={
        activeTab === 'crew' ? (
          <PFPersonFilled width={20} height={20} aria-hidden='true' />
        ) : (
          <PFPersonOutline width={20} height={20} aria-hidden='true' />
        )
      }
      count={crewCount}
      onClick={() => onTabClick('crew')}
    />
    <TabButton
      testId='mobile-tab-queue'
      active={activeTab === 'queue'}
      ariaLabel={`DJ 큐 ${queueCount}`}
      icon={<PFHeadset width={20} height={20} aria-hidden='true' />}
      count={queueCount}
      onClick={() => onTabClick('queue')}
    />
  </nav>
);

interface TabButtonProps {
  testId: string;
  active: boolean;
  /** 버튼 접근성 이름. 카운트만 보이는 탭(크루/큐)의 의미를 스크린리더에 전달 (아이콘은 aria-hidden). */
  ariaLabel: string;
  icon: ReactNode;
  text?: string;
  count?: number;
  onClick: () => void;
}

const TabButton: FC<TabButtonProps> = ({
  testId,
  active,
  ariaLabel,
  icon,
  text,
  count,
  onClick,
}) => (
  <button
    type='button'
    data-testid={testId}
    role='tab'
    aria-selected={active}
    aria-label={ariaLabel}
    className={cn(
      'min-h-[44px] py-2 flex flex-col items-center justify-center gap-0.5',
      'border-t-2',
      active ? 'text-red-400 border-red-400' : 'text-gray-400 border-transparent'
    )}
    onClick={onClick}
  >
    {icon}
    <Typography type='caption2' className='leading-none'>
      {text ?? count}
    </Typography>
  </button>
);

export default TabBar;
