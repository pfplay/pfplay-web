'use client';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';
import { BugReportForm } from './bug-report-form.component';
import { BugReportToast } from './bug-report-toast';

export function useOpenBugReportDialog() {
  const { openDialog } = useDialog();
  const t = useI18n();

  return () =>
    openDialog((_, onCancel) => ({
      title: ({ defaultClassName }) => (
        <Typography type='title2' className={defaultClassName}>
          {t.bug_report.title.report_bug}
        </Typography>
      ),
      titleAlign: 'left',
      showCloseIcon: true,
      classNames: { container: 'w-[480px] py-7 px-8 bg-black' },
      Body: (
        <>
          <BugReportToast />
          <BugReportForm onSubmitted={onCancel ?? (() => {})} />
        </>
      ),
    }));
}
