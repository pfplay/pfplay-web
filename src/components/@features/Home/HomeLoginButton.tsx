'use client';
import Link from 'next/link';
import React from 'react';
import { NO_AUTH_ROUTES } from '@/utils/routes';

const HomeLoginButton = () => {
  return (
    <Link
      href={NO_AUTH_ROUTES.AUTH.signIn}
      className='text-xl font-extrabold border-none border-2 rounded-full bg-red-800 text-white py-4 px-16'
    >
      Let your PFP Play
    </Link>
  );
};

export default HomeLoginButton;
