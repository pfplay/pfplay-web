'use client';
import { FC, useState } from 'react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { Typography } from '@/shared/ui/components/typography';

interface Props {
  onClose: () => void;
  onDismissPermanent: () => void;
}

/**
 * 모바일 디제잉 가이드 레이아웃 (1컬럼 stacking).
 *
 * 데스크탑 `DjingGuideLayout` 의 모바일 대응:
 * - 페이지네이션 대신 규칙 카드 3개를 세로로 풀폭 stacking
 * - 하단 고정 영역에 [다시 보지 않기] 체크박스 + [시작] 버튼
 *
 * 동작:
 * - [시작] 클릭 → `onClose`
 * - [다시 보지 않기] 체크 + [시작] → `onDismissPermanent` → `onClose`
 *
 * 규칙 본문은 데스크탑 가이드(guide-1/2/3.component)와 동일한 의미를 짧게
 * 모바일용으로 옮긴 것. i18n 이관은 Phase 11 에서 일괄 처리.
 */
const RULES: ReadonlyArray<{ emoji: string; title: string; detail: string }> = [
  {
    emoji: '🎧',
    title: '대기 중인 DJ 순서대로',
    detail: '대기 중인 DJ 한 명씩 순서대로 음악을 디제잉 합니다.',
  },
  {
    emoji: '🎵',
    title: '플레이리스트 순차 재생',
    detail: '플레이리스트의 가장 상단 곡부터 순차적으로 한 명당 한 곡씩 플레이됩니다.',
  },
  {
    emoji: '👍',
    title: '리액션 카운팅',
    detail: '노래가 끝나면 디제잉하는 동안 받은 좋아요/그랩/싫어요가 카운팅됩니다.',
  },
];

const GuideLayout: FC<Props> = ({ onClose, onDismissPermanent }) => {
  const t = useI18n();
  const [dismiss, setDismiss] = useState(false);

  const handleStart = () => {
    if (dismiss) onDismissPermanent();
    onClose();
  };

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 overflow-y-auto p-4 flex flex-col gap-6'>
        {RULES.map((r) => (
          <div key={r.title} className='flex flex-col gap-2'>
            <span className='text-3xl' aria-hidden='true'>
              {r.emoji}
            </span>
            <Typography type='body2'>{r.title}</Typography>
            <Typography type='detail1' className='text-gray-400'>
              {r.detail}
            </Typography>
          </div>
        ))}
      </div>
      <div className='shrink-0 p-4 flex flex-col gap-3 border-t border-gray-800'>
        <label className='flex items-center gap-2 cursor-pointer'>
          <input
            type='checkbox'
            data-testid='guide-dismiss-permanent'
            checked={dismiss}
            onChange={(e) => setDismiss(e.target.checked)}
            className='w-5 h-5'
          />
          <Typography type='detail1' className='text-gray-300'>
            {t.common.btn.dont_show_again}
          </Typography>
        </label>
        <Button data-testid='guide-start' onClick={handleStart}>
          {t.partyroom.queue.guide_start}
        </Button>
      </div>
    </div>
  );
};

export default GuideLayout;
