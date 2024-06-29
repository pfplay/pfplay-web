'use client';
import Image from 'next/image';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import useSignInForDev from '../lib/use-sign-in-for-dev.hook';

export default function SignInButtonForDev() {
  const t = useI18n();
  const signInForDev = useSignInForDev();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  return (
    <Button
      size='xl'
      typo='detail1'
      color='secondary'
      variant='outline'
      Icon={<Image src='/images/ETC/google.png' alt='google' width={32} height={32} />}
      onClick={signInForDev}
      className='w-[320px] h-[56px] mb-[40px]'
    >
      {`${t.auth.btn.connect_google} (DEV)`}
    </Button>
  );
}
