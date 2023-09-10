'use client';
import Link from 'next/link';
import React from 'react';
import { routes } from '@/constants/routes';

const HomeLoginButton = () => {
  return (
    <Link
      href={routes.signin}
      className='text-xl font-extrabold border-none border-2 rounded-full bg-red-800 text-white py-4 px-16'
    >
      Let your PFP Play
    </Link>
  );
};

export default HomeLoginButton;
