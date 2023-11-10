import { PropsWithChildren } from 'react';
import Footer from '@/components/layouts/Footer';

const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <main className='min-h-screen bg-onboarding bg-cover'>{children}</main>
      <Footer />
    </>
  );
};

export default AuthLayout;
