import { PropsWithChildren } from 'react';
import Footer from '@/components/layouts/Footer';

const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <main className='bg-onboarding px-app'>{children}</main>
      <Footer />
    </>
  );
};

export default AuthLayout;
