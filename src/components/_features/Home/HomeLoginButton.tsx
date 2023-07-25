'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import React from 'react';
import { routes } from '@/config/routes';

const HomeLoginButton = () => {
  // client session example
  const { data: session } = useSession();

  console.log({ session });

  return (
    <Link
      href={!session ? routes.signin : routes.profile.settings}
      className='text-xl font-extrabold border-none border-2 rounded-full bg-red-800 text-white py-4 px-16'
    >
      Let your PFP Play
    </Link>
  );
};

export default HomeLoginButton;
