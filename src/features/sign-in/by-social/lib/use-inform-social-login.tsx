import { useIsGuest } from '@/entities/me';
import { OAuth2Provider } from '@/shared/api/http/types/users';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import useInitiateSignIn from './use-initiate-sign-in';

export default function useInformSocialLogin(oauth2Provider: OAuth2Provider, title?: string) {
  const t = useI18n();
  const { openConfirmDialog } = useDialog();
  const isGuest = useIsGuest();
  const signIn = useInitiateSignIn(oauth2Provider);

  return async () => {
    if (!(await isGuest())) return;

    const confirmed = await openConfirmDialog({
      title: title ?? t.auth.para.need_social_login,
      okText: t.auth.btn.connect_social,
    });

    if (!confirmed) return;

    signIn();
  };
}
