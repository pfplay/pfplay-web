import React from 'react';
import Footer from '@/components/@features/Home/Footer';

const AuthLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <>
      {children}
      <Footer />
    </>
  );
};

export default AuthLayout;
