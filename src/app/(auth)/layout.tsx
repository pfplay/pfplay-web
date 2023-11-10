import { PropsWithChildren } from 'react';
import Footer from '@/components/layouts/Footer';

const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      {children}
      <Footer />
    </>
  );
};

export default AuthLayout;
