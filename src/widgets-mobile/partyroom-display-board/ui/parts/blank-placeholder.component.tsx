import { FC } from 'react';
import { useI18n } from '@/shared/lib/localization/i18n.context';

/**
 * Mode C (비재생) 안내 (spec §6.3, §3 row 11).
 *
 * **책임 분리**: 16:9 aspect / 검정 배경 / rounded 는 VideoFrame 의 wrapperClass('C')
 * 가 책임. 본 컴포넌트는 그 wrapper 의 *fill* (w-full h-full) + 중앙 정렬 + 텍스트만.
 *
 * Text styling: 기존 chunk 2 inline 의 `text-sm text-gray-500` 패턴 유지 (시각 회귀 0).
 */
const BlankPlaceholder: FC = () => {
  const t = useI18n();
  return (
    <div data-testid='blank-placeholder' className='w-full h-full flex items-center justify-center'>
      <p className='text-sm text-gray-500'>{t.partyroom.queue.no_track}</p>
    </div>
  );
};

export default BlankPlaceholder;
