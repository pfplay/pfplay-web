import { useIsGuest } from '@/entities/me';
import { OAuth2Provider } from '@/shared/api/http/types/oauth';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import useSignInOAuth2 from './use-sign-in-oauth2.hook';

export default function useInformOauth2Login(oauth2Provider: OAuth2Provider, title?: string) {
  const t = useI18n();
  const { openConfirmDialog } = useDialog();
  const isGuest = useIsGuest();
  const signIn = useSignInOAuth2(oauth2Provider);

  return async () => {
    if (!(await isGuest())) return;

    const confirmed = await openConfirmDialog({
      title:
        title ??
        (oauth2Provider === 'google'
          ? t.auth.para.need_google_login
          : 'PFPlay에선 트위터 계정을 연동하면 DJ가 될 수 있어요!'),
      okText: oauth2Provider === 'google' ? t.auth.btn.connect_google : '트위터 연동하기 (임시)',
    });

    if (!confirmed) return;

    signIn();
  };
}
