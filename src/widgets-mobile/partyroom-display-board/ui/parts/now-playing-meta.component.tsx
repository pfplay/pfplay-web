import { FC } from 'react';
import { cn } from '@/shared/lib/functions/cn';

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
      <p className='text-base font-semibold text-white truncate'>{trackName}</p>
      {djNickname && <p className='text-xs text-gray-500 truncate'>🎧 {djNickname}</p>}
      <p className='text-xs text-gray-600 shrink-0'>{duration}</p>
    </div>
  );
};

export default NowPlayingMeta;
