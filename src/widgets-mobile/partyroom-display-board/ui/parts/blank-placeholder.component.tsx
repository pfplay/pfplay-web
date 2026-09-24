import { FC } from 'react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Trans } from '@/shared/lib/localization/renderer/index.ui';

/**
 * Mode C (비재생) 안내 (spec §6.3, §3 row 11).
 *
 * **책임 분리**: 16:9 aspect / 검정 배경 / rounded 는 VideoFrame 의 VIDEO_WRAPPER_CLASS
 * 가 책임. 본 컴포넌트는 그 wrapper 의 *fill* (w-full h-full) + 중앙 정렬 + 텍스트만.
 *
 * Text styling: Main Stage reference의 두 줄 안내만 표시하고 로고/영문 문구는 노출하지 않는다.
 */
const BlankPlaceholder: FC = () => {
  const t = useI18n();
  return (
    <div
      data-testid='blank-placeholder'
      className='flex min-h-[360px] w-full flex-col items-center justify-center text-center text-gray-50'
    >
      <p className='text-[16px] leading-[1.6] text-gray-50'>{t.partyroom.queue.no_track}</p>
      <p className='text-[16px] leading-[1.6] text-gray-50'>
        <Trans i18nKey='partyroom.queue.empty_cta' />
      </p>
    </div>
  );
};

export default BlankPlaceholder;
