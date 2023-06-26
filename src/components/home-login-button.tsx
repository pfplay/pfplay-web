'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import React from 'react';

export const HomeLoginButton = () => {
  const { data: session } = useSession();

  return (
    <Link href={!session ? '/sign-in' : '/profile/edit'}>
      <p className='text-xl font-extrabold border-none border-2 rounded-full bg-red-800 text-white py-4 px-16'>
        Let your PFP Play
      </p>
    </Link>
  );
};
