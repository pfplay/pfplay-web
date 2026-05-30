'use client';
import { FC, ReactNode, useEffect, useId, useRef } from 'react';
import { cn } from '@/shared/lib/functions/cn';
import { PFArrowLeft, PFClose } from '@/shared/ui/icons';

interface Props {
  open: boolean;
  title?: string;
  onClose: () => void;
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * 모바일 풀스크린 sheet (spec §5.2).
 *
 * a11y:
 * - role=dialog + aria-modal=true + aria-labelledby={titleId}
 * - body scroll lock (open 동안)
 * - 첫 focus = × 또는 ← 버튼
 *
 * ESC handler 는 본 컴포넌트가 들지 않음 — useFullscreenSheet hook 의 ESC handler 가 단일 발화
 * (spec §5.2: popstate listener 와 ESC handler 가 같은 pop 함수 호출).
 * SheetHost 통해서만 mount 되는 chunk 4 의 사용 패턴. standalone 사용은 OUT.
 */
const FullscreenSheet: FC<Props> = ({ open, title, onClose, onBack, children, footer }) => {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);

  // scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // first focus
  useEffect(() => {
    if (!open) return;
    if (onBack) backRef.current?.focus();
    else closeRef.current?.focus();
  }, [open, onBack]);

  if (!open) return null;

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby={title ? titleId : undefined}
      className={cn(
        'fixed inset-0 z-50 bg-black flex flex-col',
        'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]'
      )}
    >
      {/* header sticky-top */}
      <header className='shrink-0 flex items-center gap-3 px-3 h-[56px] border-b border-gray-800'>
        {onBack ? (
          <button
            ref={backRef}
            type='button'
            onClick={onBack}
            data-testid='fullscreen-sheet-back'
            aria-label='뒤로'
            className='p-2 -ml-2'
          >
            <PFArrowLeft width={24} height={24} />
          </button>
        ) : (
          <button
            ref={closeRef}
            type='button'
            onClick={onClose}
            data-testid='fullscreen-sheet-close'
            aria-label='닫기'
            className='p-2 -ml-2'
          >
            <PFClose width={24} height={24} />
          </button>
        )}
        {title && (
          <h2 id={titleId} className='flex-1 text-center text-base font-medium m-0'>
            {title}
          </h2>
        )}
        <div className='w-[40px]' aria-hidden='true' />
      </header>

      {/* body scrollable */}
      <div className='flex-1 overflow-y-auto'>{children}</div>

      {/* footer sticky-bottom */}
      {footer && <div className='shrink-0 border-t border-gray-800 bg-black'>{footer}</div>}
    </div>
  );
};

export default FullscreenSheet;
