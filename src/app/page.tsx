import Image from 'next/image';

import { HomeLoginButton } from '@/components/home-login-button';

export default function Home() {
  return (
    <>
      <main className='min-h-screen flex flex-col items-center justify-center bg-onboarding bg-cover'>
        <Image
          className='mb-[72px]'
          src='/logos/wordmark_medium_white.svg'
          width={297.24}
          height={72}
          alt='logo'
        />
        <HomeLoginButton />
      </main>
      <footer className='w-full absolute bottom-[68px] flex justify-between text-white px-[120px]'>
        <p className='font-semibold underline underline-offset-4 text-sm cursor-pointer'>
          Privacy&Terms
        </p>
        <p className='font-semibold underline underline-offset-4 text-sm cursor-pointer'>
          당신의 PFP는 안녕하신가요?
        </p>
      </footer>
    </>
  );
}
