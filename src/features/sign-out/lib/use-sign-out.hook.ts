'use client';
import { useCallback } from 'react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import useSignOutMutation from '../api/use-sign-out.mutation';

export default function useSignOut() {
  const t = useI18n();
  const { openConfirmDialog } = useDialog();
  const { mutate: signOut } = useSignOutMutation();

  return useCallback(async () => {
    const confirmed = await openConfirmDialog({
      title: t.common.btn.logout,
      content: t.auth.para.logout_confirm,
    });

    if (!confirmed) return;

    signOut();
  }, [signOut, t]);
}
