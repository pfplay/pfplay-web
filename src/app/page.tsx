import Image from 'next/image';

import { HomeLoginButton } from '@/components/_features/home/home-login-button';
import { Header } from '@/components/header';

export default function Home() {
  return (
    <>
      <Header />
      <main className='flexColCenter  bg-onboarding'>
        <Image
          className='mb-[72px]'
          src='/logos/wordmark_medium_white.svg'
          width={297.24}
          height={72}
          alt='logo'
        />
        <HomeLoginButton />
      </main>
      <footer className='w-full absolute bottom-[68px] flexRow justify-between text-white px-[120px]'>
        <p className='footer-text'>Privacy&Terms</p>
        <p className='footer-text'>당신의 PFP는 안녕하신가요?</p>
      </footer>
    </>
  );
}
