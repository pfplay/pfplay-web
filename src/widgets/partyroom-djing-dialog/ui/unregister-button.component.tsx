import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { useDialog } from '@/shared/ui/components/dialog';
import { useUnregisterMeFromQueue } from '../api/use-unregister-me-from-queue.mutation';
import { usePartyroomId } from '../lib/partyroom-id.context';

export default function UnregisterButton() {
  const t = useI18n();
  const partyroomId = usePartyroomId();
  const { openConfirmDialog } = useDialog();
  const { mutate: unregisterMeFromQueue } = useUnregisterMeFromQueue();

  const unregisterMeFromDjQueue = async () => {
    const confirmed = await openConfirmDialog({
      content: t.dj.para.cancel_dj_queue_confirm,
    });
    if (!confirmed) return;

    unregisterMeFromQueue({
      partyroomId,
    });
  };

  return (
    <Button size='lg' onClick={unregisterMeFromDjQueue}>
      {t.dj.para.cancel_dj_queue}
    </Button>
  );
}
