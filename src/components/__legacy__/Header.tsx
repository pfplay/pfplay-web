'use client';
import Link from 'next/link';
import React from 'react';
import { routes } from '@/constants/routes';
import EmailBox from './EmailBox';
import Icons from './Icons';

const Header = () => {
  return (
    <header className='absolute top-10 w-full text-white flex justify-between items-center px-[120px] z-10'>
      <Link href={routes.home}>
        <Icons.logo width={116} />
      </Link>
      <div className='flexRow items-center'>
        <EmailBox />
        <Icons.worldglobe />
      </div>
    </header>
  );
};

export default Header;
