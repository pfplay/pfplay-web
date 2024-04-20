'use client';
import Image from 'next/image';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useDictionary } from '@/shared/lib/localization/dictionary.context';
import { useAppRouter } from '@/shared/lib/router/use-app-router.hook';
import { Button } from '@/shared/ui/components/button';
import { Dialog } from '@/shared/ui/components/dialog';
import { useDialog } from '@/shared/ui/components/dialog';
import { TextButton } from '@/shared/ui/components/text-button';
import { Typography } from '@/shared/ui/components/typography';
import { PFClose } from '@/shared/ui/icons';

const SignInPage = () => {
  const router = useAppRouter();
  const { openDialog } = useDialog();
  const dic = useDictionary();

  const signInGoogle = async () => {
    signIn('google', { callbackUrl: '/parties' });
  };

  const openLookAroundDialog = () => {
    return openDialog<number>((_, onClose) => ({
      title: dic['onboard.title.moment'],
      Sub: (
        <Typography type='detail1' className='text-gray-300'>
          {dic['onboard.para.guest_limit']}
        </Typography>
      ),
      Body: () => {
        return (
          <Dialog.ButtonGroup>
            <Dialog.Button
              color='secondary'
              onClick={() => {
                onClose?.();
                // 비로그인 유저가 로그인 없이 서비스를 이용할 때에는, 메인스테이지(파티룸)로 바로 뛀궈준다.
                router.push('/parties/[id]', { path: { id: 1 } });
              }}
              className='flex-none px-[10.5px]'
            >
              {dic['onboard.btn.guest']}
            </Dialog.Button>
            <Dialog.Button onClick={signInGoogle}>{dic['auth.btn.connect_google']}</Dialog.Button>
          </Dialog.ButtonGroup>
        );
      },
    }));
  };

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

        <Button
          size='xl'
          typo='detail1'
          color='secondary'
          variant='outline'
          Icon={<Image src='/images/ETC/google.png' alt='google' width={32} height={32} />}
          onClick={signInGoogle}
          className='w-[320px] h-[56px] mb-[40px]'
        >
          Sign in With Google
        </Button>

        <TextButton onClick={openLookAroundDialog} underline>
          {dic['onboard.btn.take_a_look']}
        </TextButton>
      </div>
    </div>
  );
};

export default SignInPage;
