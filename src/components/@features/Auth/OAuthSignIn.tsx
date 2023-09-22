'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import React from 'react';
import Button from '@/components/@shared/@atoms/Button';
import TextButton from '@/components/@shared/@atoms/TextButton';
import Typography from '@/components/@shared/@atoms/Typography';
import Dialog from '@/components/@shared/Dialog';
import Icons from '@/components/__legacy__/Icons';
import { useDialog } from '@/hooks/useDialog';
import { NO_AUTH_ROUTES, ROUTES } from '@/utils/routes';

const OAuthSignIn = () => {
  const router = useRouter();
  const { openDialog } = useDialog();

  const handleBrowseButtonClick = async () => {
    const result = await openFullDialog();

    if (result) alert(`확인됐어요. (value: ${result})`);
    if (!result) alert('취소됐어요.');
  };

  const signInAnonymous = () => {
    router.push(NO_AUTH_ROUTES.PARTIES.index);
  };

  const signInGoogle = () => {
    signIn('google', {
      callbackUrl: ROUTES.PARTIES.index,
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
        <Link href={NO_AUTH_ROUTES.HOME.index} className='absolute right-10 top-10'>
          <Icons.close />
        </Link>

        <div className='w-[150px] h-[36px] mb-[68px]'>
          <Image
            src='/logos/wordmark_medium_white.svg'
            alt='logo'
            width={150}
            height={36}
            className='w-full h-full object-contain select-none pointer-events-none'
          />
        </div>

        <Button
          size='xl'
          typo='detail1'
          color='secondary'
          variant='outline'
          Icon={<Icons.google />}
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
