import { cn } from '@/shared/lib/functions/cn';

type Props = {
  variant: 'now' | 'next';
  /** 표시 문구. i18n 조회는 호출자 책임 — 본 컴포넌트는 순수 표시. */
  label: string;
  className?: string;
};

/**
 * 현재곡·다음곡 커서 배지 (#462 시안).
 *
 * 데스크탑·시네마에서는 ⋮ 메뉴 자리를 대체하고, 모바일 시트에서는 ✕ 왼쪽에 붙는다.
 * 배치는 호출자가 className 으로 정한다.
 */
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
