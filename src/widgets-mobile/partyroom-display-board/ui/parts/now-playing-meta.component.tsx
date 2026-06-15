import { FC } from 'react';
import { cn } from '@/shared/lib/functions/cn';
import { TrackTitle } from '@/shared/ui/components/track-title';
import { Typography } from '@/shared/ui/components/typography';
import { PFHeadset } from '@/shared/ui/icons';

interface Props {
  layout: 'column' | 'row';
  trackName: string;
  djNickname: string | null;
  /** `M:SS` 또는 `MM:SS` 사전 포맷 문자열. parent 가 책임. */
  duration: string;
}

/**
 * 트랙메타 — Mode A = column, Mode B = row (spec §4.4 / §6.4 prop 정의).
 *
 * `layout` prop 의미: 본 컴포넌트 *내부* 의 배치만 결정.
 * - column = 트랙명 / DJ / duration 세 줄 vertical stack
 * - row = 트랙명 · DJ · duration 한 줄 horizontal inline
 *
 * **외부 배치는 NowPlayingRow (root) 책임**. `flex-1` / `min-w-0` 등 부모 토큰 미보유.
 */
const NowPlayingMeta: FC<Props> = ({ layout, trackName, djNickname, duration }) => {
  return (
    <div
      className={cn(
        'flex',
        layout === 'column' ? 'flex-col space-y-1' : 'flex-row items-center gap-2'
      )}
    >
      <TrackTitle name={trackName} emptyText='' />
      {djNickname && (
        <span
          data-testid='now-playing-dj'
          className='flex items-center gap-1 text-gray-500 min-w-0'
        >
          <PFHeadset width={14} height={14} aria-hidden='true' />
          <Typography type='caption2' overflow='ellipsis' className='text-gray-500'>
            {djNickname}
          </Typography>
        </span>
      )}
      <Typography type='caption2' className='text-gray-600 shrink-0'>
        {duration}
      </Typography>
    </div>
  );
};

export default NowPlayingMeta;
