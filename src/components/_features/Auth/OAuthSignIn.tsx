'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { routes } from '@/config/routes';
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

  const signInAnnonynmous = () => {
    router.push(`${routes.parties.base}`);
  };
  const signInGoogle = () => {
    signIn('google', { callbackUrl: routes.home });
  };

  return (
    <>
      <div className='flexRowCenter text-white h-screen relative'>
        <div
          className='flexCol items-center w-[640px] backdrop-blur-lg relative border border-grey-800 bg-[#180202]/50' /* FIXME: 180202 는 디자인 시스템에 없는 hex */
        >
          <Link href={routes.home} className='absolute right-10 top-10'>
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
              intent={'secondary-outline'}
              onClick={signInGoogle}
              className='justify-start w-80 py-3 pl-5 mb-10'
            >
              <Image src='/icons/google.png' alt='google login' width={32} height={32} />
              <span className='ml-3 font-poppins'>Sign in With Google</span>
            </Button>

            <Button
              intent={'secondary-outline'}
              className='text-sm font-normal text-grey-200 cursor-pointer underline border-none'
              onClick={handleOpenModal}
            >
              먼저 둘러볼래요
            </Button>
          </div>
        </div>
      </div>
      <SignInNotifModal
        isOpen={isOpen}
        onModalClose={handleModalClose}
        onConfirmClick={signInGoogle}
        onCancelClick={signInAnnonynmous}
      />
    </>
  );
};

export default OAuthSignIn;
