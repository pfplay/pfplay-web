'use client';
import { FC, ReactNode, useEffect, useId, useRef } from 'react';
import { cn } from '@/shared/lib/functions/cn';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Typography } from '@/shared/ui/components/typography';
import { PFArrowLeft, PFClose } from '@/shared/ui/icons';

interface Props {
  open: boolean;
  title?: string;
  onClose: () => void;
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
  sheetKey?: string;
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
const FullscreenSheet: FC<Props> = ({
  open,
  title,
  onClose,
  onBack,
  children,
  footer,
  sheetKey,
}) => {
  const t = useI18n();
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
      data-sheet-key={sheetKey}
      className={cn(
        'fixed inset-0 z-50 bg-black flex flex-col',
        'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]'
      )}
    >
      {/* header sticky-top */}
      <header className='flex h-[108px] shrink-0 items-end gap-3 px-8 pb-5'>
        <div className='flex w-10 items-center justify-start'>
          {onBack ? (
            <button
              ref={backRef}
              type='button'
              onClick={onBack}
              data-testid='fullscreen-sheet-back'
              aria-label={t.common.btn.back}
              className='p-2 -ml-2'
            >
              <PFArrowLeft width={30} height={30} />
            </button>
          ) : (
            <button
              ref={closeRef}
              type='button'
              onClick={onClose}
              data-testid='fullscreen-sheet-close'
              aria-label={t.common.btn.close}
              className='p-2 -ml-2'
            >
              <PFClose width={30} height={30} />
            </button>
          )}
        </div>
        {title && (
          <Typography id={titleId} as='h2' type='title2' className='flex-1 text-center'>
            {title}
          </Typography>
        )}
        <div className='w-10' />
      </header>

      {/* body scrollable */}
      <div className='flex-1 overflow-y-auto'>{children}</div>

      {/* footer sticky-bottom */}
      {footer && <div className='shrink-0 border-t border-gray-800 bg-black'>{footer}</div>}
    </div>
  );
};

export default FullscreenSheet;
