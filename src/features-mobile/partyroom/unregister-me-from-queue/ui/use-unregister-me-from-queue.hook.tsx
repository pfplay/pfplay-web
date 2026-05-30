'use client';
import { useCallback } from 'react';
import { useUnregisterMeFromQueue } from '@/features/partyroom/unregister-me-from-queue';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';

export default function useMobileUnregisterMeFromQueue({ partyroomId }: { partyroomId: number }) {
  const t = useI18n();
  const { openConfirmDialog } = useDialog();
  const { mutate: unregisterMutate } = useUnregisterMeFromQueue();

  return useCallback(async () => {
    const confirmed = await openConfirmDialog({ content: t.partyroom.queue.unregister_confirm });
    if (!confirmed) return;
    unregisterMutate({ partyroomId });
  }, [partyroomId, openConfirmDialog, unregisterMutate, t.partyroom.queue.unregister_confirm]);
}
