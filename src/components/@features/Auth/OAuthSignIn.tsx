'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import React, { useCallback, useState } from 'react';
import Button from '@/components/@shared/@atoms/Button';
import TextButton from '@/components/@shared/@atoms/TextButton';
import Icons from '@/components/__legacy__/Icons';
import { NO_AUTH_ROUTES, ROUTES } from '@/utils/routes';
import SignInNotifModal from './SignInNotifModal';

const OAuthSignIn = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleModalClose = () => {
    setIsOpen(false);
  };

  const signInAnonymous = () => {
    router.push(ROUTES.PARTIES.index);
  };
  const signInGoogle = () => {
    signIn('google', {
      callbackUrl: NO_AUTH_ROUTES.HOME.index,
    });
  };

  return (
    <>
      <div className='flexRowCenter text-white h-screen relative'>
        <div
          className='flexCol items-center w-[640px] backdrop-blur-lg relative border border-gray-800 bg-[#180202]/50' /* FIXME: 180202 는 디자인 시스템에 없는 hex */
        >
          <Link href={NO_AUTH_ROUTES.HOME.index} className='absolute right-10 top-10'>
            <Image src='/icons/icn_close.svg' alt='close' width={20} height={20} />
          </Link>
          <div className='w-full py-[70px] flexColCenter'>
            <Image
              className='mb-[68px]'
              src='/logos/wordmark_medium_white.svg'
              width={115.59}
              height={28}
              alt='logo'
            />

            <Button
              size='xl'
              typo='detail1'
              color='secondary'
              variant='outline'
              Icon={<Icons.google />}
              onClick={signInGoogle}
              className='mb-[40px] w-[320px]'
            >
              Sign in With Google
            </Button>

            <TextButton onClick={handleOpenModal} underline>
              먼저 둘러볼래요
            </TextButton>
          </div>
        </div>
      </div>
      <SignInNotifModal
        isOpen={isOpen}
        onModalClose={handleModalClose}
        onConfirmClick={signInGoogle}
        onCancelClick={signInAnonymous}
      />
    </>
  );
};

export default OAuthSignIn;
