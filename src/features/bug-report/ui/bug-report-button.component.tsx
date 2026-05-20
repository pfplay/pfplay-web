'use client';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useOpenBugReportDialog } from './bug-report-dialog.component';
import PFBug from './pf-bug-icon';

export function BugReportButton() {
  const t = useI18n();
  const openDialog = useOpenBugReportDialog();

  return (
    <button
      type='button'
      onClick={openDialog}
      aria-label={t.bug_report.btn.open}
      className='text-gray-400 hover:text-gray-200 transition-colors'
      data-testid='bug-report-button'
    >
      <PFBug width={24} height={24} />
    </button>
  );
}
