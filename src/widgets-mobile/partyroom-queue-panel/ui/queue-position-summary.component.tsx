'use client';
import { FC } from 'react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { processI18nString } from '@/shared/lib/localization/renderer/processors/variable-processor-util';
import { Typography } from '@/shared/ui/components/typography';

interface Props {
  /** 정렬된 큐에서 내 1-based 순번 (1 = 현재 DJ). */
  position: number;
  /** 큐 전체 DJ 수 (현재 DJ 포함). */
  total: number;
  /** 내가 현재 재생 중인 DJ 인지 (position === 1). */
  isCurrent: boolean;
}

/**
 * 좁은 모바일 큐 영역에서 목록을 스크롤·스캔하지 않고도 "내 차례"를 한눈에 알리는 요약 바.
 * 큐에 등록된 멤버에게만(footer 액션 위) 표시. 데스크탑은 전체 큐가 보이므로 불필요.
 */
const QueuePositionSummary: FC<Props> = ({ position, total, isCurrent }) => {
  const t = useI18n();
  const label = isCurrent
    ? t.partyroom.queue.my_turn_now
    : processI18nString(t.partyroom.queue.my_position, {
        position: String(position),
        total: String(total),
      });

  return (
    <div
      data-testid='queue-position-summary'
      className='shrink-0 px-4 py-2 border-t border-gray-800 bg-gray-900 text-center'
    >
      <Typography type='detail1' className='text-primary-300'>
        {label}
      </Typography>
    </div>
  );
};

export default QueuePositionSummary;
