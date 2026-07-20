import { cn } from '@/shared/lib/functions/cn';

/** 막대별 시작 지연 — 전부 다르게 줘야 파형이 어긋나 살아 있어 보인다. */
const BAR_DELAYS = ['0ms', '150ms', '300ms', '450ms'];

type Props = {
  className?: string;
};

/**
 * 재생 중 썸네일 위에 얹는 이퀄라이저 (#462 시안).
 *
 * 썸네일을 어둡게 깔고 흰 막대가 위아래로 뛴다.
 * 상태 전달은 CursorBadge 텍스트가 하므로 여기선 aria-hidden.
 */
const PlayingBars = ({ className }: Props) => (
  <div
    data-testid='playing-bars'
    aria-hidden='true'
    className={cn('flexRowCenter gap-[3px] bg-black/50', className)}
  >
    {BAR_DELAYS.map((delay) => (
      <span
        key={delay}
        style={{ animationDelay: delay }}
        className='w-[3px] h-3 origin-center rounded-full bg-white animate-equalizer motion-reduce:animate-none'
      />
    ))}
  </div>
);

export default PlayingBars;
