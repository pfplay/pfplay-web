import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import useCanLockDjingQueue from './use-can-lock-djing-queue.hook';
import { default as useLockDjingQueueMutation } from '../api/use-lock-djing-queue.mutation';

export default function useLockDjingQueue() {
  const t = useI18n();
  const { mutate } = useLockDjingQueueMutation();
  const canLockDjingQueue = useCanLockDjingQueue();
  const { openConfirmDialog } = useDialog();

  return async () => {
    if (!canLockDjingQueue) return;

    const confirmed = await openConfirmDialog({
      content: t.dj.para.lock_dj_queue,
    });

    if (!confirmed) return;

    mutate();
  };
}
