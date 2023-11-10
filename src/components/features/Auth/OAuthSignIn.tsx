'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

import Dialog from '@/components/shared/Dialog';
import Button from '@/components/shared/atoms/Button';
import TextButton from '@/components/shared/atoms/TextButton';
import Typography from '@/components/shared/atoms/Typography';
import { PFClose } from '@/components/shared/icons';
import { useDialog } from '@/hooks/useDialog';

const OAuthSignIn = () => {
  const router = useRouter();
  const { openDialog } = useDialog();

  const handleBrowseButtonClick = async () => {
    await openFullDialog();
    return;
  };

  const signInAnonymous = () => {
    router.push('/parties');
  };

  const signInGoogle = () => {
    signIn('google', {
      callbackUrl: '/parties',
    });
  };

  const openFullDialog = () => {
    return openDialog<number>(() => ({
      title: '잠깐만요!',
      Sub: (
        <Typography type='detail1' className='text-gray-300'>
          비로그인 입장 시 접근 가능한 기능이 제한됩니다
          <br /> 구글 계정을 연동하면 온전한 서비스를 즐길 수 있어요
        </Typography>
      ),
      Body: () => {
        return (
          <Dialog.ButtonGroup>
            <Dialog.Button
              color='secondary'
              onClick={() => signInAnonymous()}
              className='flex-none px-[10.5px]'
            >
              비로그인 입장하기
            </Dialog.Button>
            <Dialog.Button onClick={() => signInGoogle()}>구글 연동하기</Dialog.Button>
          </Dialog.ButtonGroup>
        );
      },
    }));
  };

  return (
    <div className='relative min-h-screen flexRowCenter'>
      <div className='relative flexCol items-center px-[160px] pt-[62px] pb-[65px] backdrop-blur-xl bg-backdrop-black/50 border border-gray-800'>
        <Link href='/' className='absolute right-10 top-10'>
          <PFClose />
        </Link>

        <div className='w-[150px] h-[36px] mb-[68px]'>
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

        <TextButton onClick={handleBrowseButtonClick} underline>
          먼저 둘러볼래요
        </TextButton>
      </div>
    </div>
  );
};

export default OAuthSignIn;
