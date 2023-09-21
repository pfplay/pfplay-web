'use client';
import Link from 'next/link';
import React from 'react';
import { NO_AUTH_ROUTES } from '@/utils/routes';
import Icons from './Icons';

const Header = () => {
  return (
    <header className='absolute top-10 w-full text-white flex justify-between items-center px-[120px] z-10'>
      <Link href={NO_AUTH_ROUTES.HOME.index}>
        <Icons.logo width={116} />
      </Link>
      <div className='flexRow items-center'>
        <Icons.worldglobe />
      </div>
    </header>
  );
};

export default Header;
