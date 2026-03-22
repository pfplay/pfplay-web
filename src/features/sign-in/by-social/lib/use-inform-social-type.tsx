import Image from 'next/image';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { useDialog } from '@/shared/ui/components/dialog';
import useInitiateSignIn from './use-initiate-sign-in';

export default function useInformSocialType() {
  const t = useI18n();
  const { openDialog } = useDialog();
  const signInByGoogle = useInitiateSignIn('google');
  const signInByTwitter = useInitiateSignIn('twitter');

  return () =>
    openDialog((_, onClose) => ({
      showCloseIcon: true,
      title: t.auth.para.need_social_login,
      okText: t.auth.btn.connect_social,
      Body: () => (
        <div className='flex flex-col gap-[20px]'>
          <Button
            size='xl'
            typo='detail1'
            color='secondary'
            variant='outline'
            Icon={<Image src='/images/ETC/google.png' alt='google' width={32} height={32} />}
            onClick={() => {
              signInByGoogle();
              onClose?.();
            }}
          >
            {t.auth.btn.connect_google}
          </Button>

          <Button
            size='xl'
            typo='detail1'
            color='secondary'
            variant='outline'
            Icon={<Image src='/images/ETC/twitter.png' alt='twitter' width={32} height={32} />}
            onClick={() => {
              signInByTwitter();
              onClose?.();
            }}
            className='mb-[30px]'
          >
            {t.auth.btn.connect_twitter}
          </Button>
        </div>
      ),
      classNames: {
        container: 'w-[500px]',
      },
    }));
}
