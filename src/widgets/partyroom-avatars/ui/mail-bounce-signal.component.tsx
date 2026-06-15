import { cn } from '@/shared/lib/functions/cn';

type Props = {
  signalKey?: number;
  className?: string;
};

const MAILS = [
  { index: 0, positionClassName: 'left-[calc(50%-24px)] bottom-0', animationClassName: '' },
  {
    index: 1,
    positionClassName: 'left-1/2 bottom-3',
    animationClassName: '[animation-delay:120ms]',
  },
  {
    index: 2,
    positionClassName: 'left-[calc(50%+24px)] bottom-1',
    animationClassName: '[animation-delay:240ms]',
  },
] as const;
const MAIL_GLYPH = String.fromCodePoint(0x2709, 0xfe0f);

export default function MailBounceSignal({ signalKey, className }: Props) {
  if (signalKey === undefined) {
    return null;
  }

  return (
    <div
      key={signalKey}
      data-testid='mail-bounce-signal'
      className={cn(
        'pointer-events-none absolute left-1/2 top-1 z-10 h-12 w-16 -translate-x-1/2 -translate-y-2/3',
        className
      )}
    >
      {MAILS.map((mail) => (
        <span
          key={mail.index}
          data-testid='mail-bounce-item'
          data-mail-index={String(mail.index)}
          className={cn('absolute -translate-x-1/2', mail.positionClassName)}
        >
          <span
            aria-hidden='true'
            className={cn(
              'block text-[18px] opacity-0 animate-mail-bounce',
              mail.index === 0
                ? 'motion-reduce:animate-mail-bounce-reduced'
                : 'motion-reduce:hidden',
              mail.animationClassName
            )}
          >
            {MAIL_GLYPH}
          </span>
        </span>
      ))}
    </div>
  );
}
