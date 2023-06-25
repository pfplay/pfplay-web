// import RootLayout from '@/components/layout/RootLayout'
import { OAuthLogIn } from '@/components/auth/oauth-login';
import type { Metadata } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'DEV-PFPLAY',
  description: 'Your Space',
};

export default function LoginPage() {
  return (
    <main className='min-h-screen bg-onboarding bg-cover'>
      <OAuthLogIn />
    </main>
  );
}

