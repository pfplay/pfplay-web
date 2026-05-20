'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { TextButton } from '@/shared/ui/components/text-button';
import { TextArea } from '@/shared/ui/components/textarea';
import { Typography } from '@/shared/ui/components/typography';
import {
  bugReportSchema,
  BUG_REPORT_CONTENT_MAX,
  type BugReportSchema,
} from '../model/bug-report-schema';
import { useBugReportToast } from '../model/use-bug-report-toast.hook';
import { useSubmitBugReport } from '../model/use-submit-bug-report.hook';

type Props = {
  onSubmitted: () => void;
};

export function BugReportForm({ onSubmitted }: Props) {
  const t = useI18n();
  const { register, handleSubmit, watch, formState } = useForm<BugReportSchema>({
    resolver: zodResolver(bugReportSchema),
    mode: 'onChange',
    defaultValues: { content: '' },
  });
  const content = watch('content') ?? '';
  const mutation = useSubmitBugReport();
  const toast = useBugReportToast();

  const onSubmit = (data: BugReportSchema) => {
    mutation.mutate(
      { content: data.content },
      {
        onSuccess: () => {
          toast.show({ severity: 'success', message: t.bug_report.toast.success });
          onSubmitted();
        },
        onError: (err: unknown) => {
          const status = (err as { response?: { status?: number } })?.response?.status;
          toast.show({
            severity: 'error',
            message: status === 429 ? t.bug_report.toast.rate_limit : t.bug_report.toast.error,
          });
        },
      }
    );
  };

  const errorMessageKey = formState.errors.content?.message as 'too_short' | 'too_long' | undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
      <TextArea
        {...register('content')}
        rows={6}
        placeholder={t.bug_report.placeholder}
        maxLength={BUG_REPORT_CONTENT_MAX}
        aria-label={t.bug_report.title.report_bug}
        data-testid='bug-report-content'
      />
      <div className='flex justify-between'>
        <Typography type='detail2' className='text-gray-300'>
          {t.bug_report.help}
        </Typography>
        <Typography
          type='detail2'
          className={
            content.length > BUG_REPORT_CONTENT_MAX * 0.9 ? 'text-red-400' : 'text-gray-300'
          }
        >
          {content.length}/{BUG_REPORT_CONTENT_MAX}
        </Typography>
      </div>
      {errorMessageKey && (
        <Typography type='detail2' className='text-red-400'>
          {t.bug_report.validation[errorMessageKey]}
        </Typography>
      )}
      <div className='flex justify-end gap-3'>
        <TextButton onClick={onSubmitted} type='button'>
          {t.bug_report.btn.cancel}
        </TextButton>
        <Button
          type='submit'
          color='primary'
          disabled={!formState.isValid || mutation.isPending}
          data-testid='bug-report-submit'
        >
          {t.bug_report.btn.submit}
        </Button>
      </div>
    </form>
  );
}
