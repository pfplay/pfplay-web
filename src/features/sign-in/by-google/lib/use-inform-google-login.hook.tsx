import { useIsGuest } from '@/entities/me';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import useSignIn from './use-sign-in.hook';

export default function useInformGoogleLogin(title?: string) {
  const t = useI18n();
  const { openConfirmDialog } = useDialog();
  const isGuest = useIsGuest();
  const signIn = useSignIn();

  return async () => {
    if (!(await isGuest())) return;

    const confirmed = await openConfirmDialog({
      title: title ?? t.auth.para.need_google_login,
      okText: t.common.btn.google_login,
    });

    if (!confirmed) return;

    signIn();
  };
}
