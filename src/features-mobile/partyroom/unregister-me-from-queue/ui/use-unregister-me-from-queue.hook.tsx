'use client';
import { useCallback } from 'react';
import { useUnregisterMeFromQueue } from '@/features/partyroom/unregister-me-from-queue';
import { useDialog } from '@/shared/ui/components/dialog';

export default function useMobileUnregisterMeFromQueue({ partyroomId }: { partyroomId: number }) {
  const { openConfirmDialog } = useDialog();
  const { mutate: unregisterMutate } = useUnregisterMeFromQueue();

  return useCallback(async () => {
    const confirmed = await openConfirmDialog({ content: '정말 큐에서 나가시겠어요?' });
    if (!confirmed) return;
    unregisterMutate({ partyroomId });
  }, [partyroomId, openConfirmDialog, unregisterMutate]);
}
