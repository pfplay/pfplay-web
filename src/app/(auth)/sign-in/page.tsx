import OAuthSignIn from '@/components/_features/Auth/OAuthSignIn';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DEV-PFPLAY',
  description: 'Your Space', // TODO: edit description
};

const SignInPage = () => {
  return (
    <main className='min-h-screen bg-onboarding bg-cover'>
      <OAuthSignIn />
    </main>
  );
};

export default SignInPage;

