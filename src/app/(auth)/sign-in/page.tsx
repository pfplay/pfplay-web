import type { Metadata } from 'next';
import OAuthSignIn from '@/components/@features/Auth/OAuthSignIn';
import { PAGE_METADATA } from '@/utils/routes';

export const metadata: Metadata = PAGE_METADATA.AUTH.SIGN_IN.index;

const SignInPage = () => {
  return (
    <main className='min-h-screen bg-onboarding bg-cover'>
      <OAuthSignIn />
    </main>
  );
};

export default SignInPage;
