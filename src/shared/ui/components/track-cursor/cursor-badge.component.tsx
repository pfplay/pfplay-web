import { cn } from '@/shared/lib/functions/cn';

type Props = {
  variant: 'now' | 'next';
  label: string;
  className?: string;
};

/** 데스크탑·시네마는 ⋮ 왼쪽, 모바일 시트는 ✕ 왼쪽에 붙는다. 기존 버튼은 그대로 둔다. */
const CursorBadge = ({ variant, label, className }: Props) => (
  <span
    data-testid={variant === 'now' ? 'track-badge-now' : 'track-badge-next'}
    className={cn(
      'inline-flex shrink-0 items-center rounded-full px-2 py-[3px] text-[11px] font-bold leading-[14px]',
      variant === 'now' ? 'bg-red-300 text-white' : 'bg-gray-600 text-gray-100',
      className
    )}
  >
    {label}
  </span>
);

export default CursorBadge;
