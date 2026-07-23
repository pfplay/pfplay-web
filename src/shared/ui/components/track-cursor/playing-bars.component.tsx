import { cn } from '@/shared/lib/functions/cn';

const BAR_DELAYS = ['0ms', '150ms', '300ms', '450ms'];

type Props = {
  className?: string;
};

/** 재생 중 상태는 CursorBadge 텍스트가 전달하므로 여기선 aria-hidden. */
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
