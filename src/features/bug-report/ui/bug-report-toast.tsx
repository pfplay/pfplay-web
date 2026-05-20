'use client';
import { cn } from '@/shared/lib/functions/cn';
import { Typography } from '@/shared/ui/components/typography';
import { useBugReportToast } from '../model/use-bug-report-toast.hook';

const ACCENT: Record<string, string> = {
  success: 'border-l-green-400',
  error: 'border-l-red-300',
};

export function BugReportToast() {
  const current = useBugReportToast((s) => s.current);
  const dismiss = useBugReportToast((s) => s.dismiss);
  if (!current) return null;
  return (
    <div
      data-testid='bug-report-toast'
      role='status'
      className={cn(
        'pointer-events-auto w-full bg-gray-800 border border-gray-700 rounded-[6px] border-l-[3px] mb-3',
        ACCENT[current.severity]
      )}
    >
      <div className='px-4 py-3 flex items-start gap-3'>
        <Typography type='detail2' className='text-gray-50 flex-1'>
          {current.message}
        </Typography>
        <button
          type='button'
          onClick={dismiss}
          data-testid='bug-report-toast-close'
          className='text-gray-400 hover:text-gray-200 leading-none px-1 -mt-0.5'
        >
          ×
        </button>
      </div>
    </div>
  );
}
