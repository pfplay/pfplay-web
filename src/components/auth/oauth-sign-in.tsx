'use client';
import { routes } from '@/config/routes';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useState } from 'react';
import { SignInNotifModal } from '../modal/signin-notif-modal';

export const OAuthSignIn = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleModalClose = () => {
    setIsOpen(false);
  };

  // TODO: set main stage party room number
  const signInAnnonynmous = () => {
    router.push(`${routes.party.base}/1`);
  };
  const signInGoogle = () => {
    signIn('google', { callbackUrl: routes.home });
  };

  return (
    <>
      <div className='flexRowCenter text-white h-screen relative'>
        <div className='flexCol items-center w-[640px] backdrop-blur-lg relative border border-[#1c1c1c] bg-[#180202]/50'>
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
            <button
              className='inline-flex items-center w-80 py-3 pl-5 border border-neutral-500 rounded mb-10'
              onClick={signInGoogle}
            >
              <Image src='/icons/google.png' alt='google login' width={32} height={32} />
              <span className='ml-3 font-poppins'>Sign in With Google</span>
            </button>
            <button
              className='text-sm text-neutral-300 cursor-pointer border-b'
              onClick={handleOpenModal}
            >
              먼저 둘러볼래요
            </button>
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

