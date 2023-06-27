// import RootLayout from '@/components/layout/RootLayout'

import { OAuthSignIn } from '@/components/_features/auth/oauth-sign-in';
import type { Metadata } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'DEV-PFPLAY',
  description: 'Your Space',
};

export default function SignInPage() {
  return (
    <main className='min-h-screen bg-onboarding bg-cover'>
      <OAuthSignIn />
    </main>
  );
}

