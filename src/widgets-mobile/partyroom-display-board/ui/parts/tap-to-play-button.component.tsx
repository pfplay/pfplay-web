import { FC } from 'react';

interface Props {
  /**
   * **합성 (pre-computed) prop**: root 에서 `gate.autoplayBlocked && !gate.played`
   * 를 미리 계산해 내려주는 합성 boolean. 본 컴포넌트는 raw `gate.autoplayBlocked`
   * 를 받지 않으며 `played` 도 받지 않는다 (spec §6.5.2 single source of truth).
   */
  autoplayBlocked: boolean;
  onTap: () => void;
}

/**
 * Mode B 의 release 경로 — autoplay 차단 시 NowPlayingMeta row 옆 sibling 으로 렌더.
 *
 * State 공유 보장 (spec §6.5.2): autoplayBlocked + onTap 모두 root 의 동일
 * useAutoplayGestureGate gate state 에서 내려옴 → AutoplayGestureGate 와 single source.
 *
 * **positioning 책임은 parent (NowPlayingRow)**.
 */
const TapToPlayButton: FC<Props> = ({ autoplayBlocked, onTap }) => {
  if (!autoplayBlocked) return null;
  return (
    <button
      type='button'
      aria-label='재생'
      onClick={onTap}
      className='shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center rounded bg-white/90 text-black'
    >
      <svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor' aria-hidden>
        <path d='M8 5v14l11-7z' />
      </svg>
    </button>
  );
};

export default TapToPlayButton;
