import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import useCanDeleteDjFromQueue from './use-can-delete-dj-from-queue.hook';
import useDeleteDjFromQueueMutation from '../api/use-delete-dj-from-queue.mutation';

export default function useDeleteDjFromQueue() {
  const t = useI18n();
  const { mutate } = useDeleteDjFromQueueMutation();
  const canDeleteDjFromQueue = useCanDeleteDjFromQueue();
  const { openConfirmDialog } = useDialog();

  return async (djId: string) => {
    if (!canDeleteDjFromQueue) return;

    const confirmed = await openConfirmDialog({
      content: t.dj.para.delete_dj_queue,
    });

    if (!confirmed) return;

    mutate(djId);
  };
}
