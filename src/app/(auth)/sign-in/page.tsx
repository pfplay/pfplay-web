'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePrefetchMe } from '@/entities/me';
import { SignInByGoogleButtonForDev, useSignInByGoogle } from '@/features/sign-in/by-google';
import { useSignInByGuest } from '@/features/sign-in/by-guest';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useAppRouter } from '@/shared/lib/router/use-app-router.hook';
import { Button } from '@/shared/ui/components/button';
import { TextButton } from '@/shared/ui/components/text-button';
import { PFClose } from '@/shared/ui/icons';

export default function SignInPage() {
  const t = useI18n();
  const router = useAppRouter();

  const prefetchMe = usePrefetchMe();
  const signInByGoogle = useSignInByGoogle();
  const signInByGuest = useSignInByGuest({
    onClickSignInByGoogle: signInByGoogle,
    onSuccess: async () => {
      await prefetchMe();
      router.push('/parties');
    },
  });

  return (
    <div className='relative min-h-screen flexRowCenter'>
      <div className='relative w-full max-w-[640px] flexColCenter px-[20px] pt-[62px] pb-[65px] backdrop-blur-xl bg-backdrop-black/50 border border-gray-800'>
        <Link href='/' className='absolute right-6 top-6 tablet:right-10 tablet:top-10'>
          <PFClose />
        </Link>

        <div className='w-[150px] max-w-full h-[36px] mb-[68px]'>
          <Image
            src='/images/Logo/wordmark_medium_white.png'
            alt='logo'
            width={150}
            height={36}
            className='object-contain w-full h-full pointer-events-none select-none'
          />
        </div>

        <SignInByGoogleButtonForDev />

        <Button
          size='xl'
          typo='detail1'
          color='secondary'
          variant='outline'
          Icon={<Image src='/images/ETC/google.png' alt='google' width={32} height={32} />}
          onClick={signInByGoogle}
          className='w-[320px] h-[56px] mb-[40px]'
        >
          {t.auth.btn.connect_google}
        </Button>

        <TextButton onClick={signInByGuest} underline>
          {t.onboard.btn.take_a_look}
        </TextButton>
      </div>
    </div>
  );
}
