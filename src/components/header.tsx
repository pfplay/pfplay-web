import { routes } from '@/config/routes';
import Link from 'next/link';
import React from 'react';
import { Icons } from './icons';
import { EmailBox } from './email-box';

export const Header = () => {
  return (
    <header className='absolute top-10 w-full text-white flex justify-between items-center px-[120px] z-10'>
      <Link href={routes.home}>
        <Icons.logo width={116} />
      </Link>
      <div className='flexRow items-center'>
        <EmailBox />
        <Icons.wordglobe />
      </div>
    </header>
  );
};
