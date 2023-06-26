import { routes } from '@/config/routes';
import Link from 'next/link';
import React from 'react';
import { EmailBox } from './ui/EmailBox';
import { Logo, WorldGlobe } from './ui/icon';

export const Header = () => {
  return (
    <header className='absolute top-11 w-full h-ull text-white flex justify-between items-center px-[120px] z-10'>
      <Link href={routes.home} passHref>
        <Logo />
      </Link>
      <div className='flexRow items-center'>
        <EmailBox />
        <WorldGlobe />
      </div>
    </header>
  );
};
