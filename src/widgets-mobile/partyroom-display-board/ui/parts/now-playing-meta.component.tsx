import { FC } from 'react';
import { TrackTitle } from '@/shared/ui/components/track-title';
import { Typography } from '@/shared/ui/components/typography';
import { PFHeadset } from '@/shared/ui/icons';

interface Props {
  trackName: string;
  djNickname: string | null;
  /** `M:SS` 또는 `MM:SS` 사전 포맷 문자열. parent 가 책임. */
  duration: string;
}

/**
 * 트랙메타 — 트랙명 / DJ / duration 세 줄 vertical stack.
 *
 * 과거 Mode B(80×45 축소) 전용 `row` layout 이 있었으나 ToS 최소 크기(issue #420)로
 * 축소 모드가 제거되며 column 단일 layout 만 남았다.
 *
 * **외부 배치는 NowPlayingRow (root) 책임**. `flex-1` / `min-w-0` 등 부모 토큰 미보유.
 */
const NowPlayingMeta: FC<Props> = ({ trackName, djNickname, duration }) => {
  return (
    <div className='flex flex-col space-y-1'>
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
