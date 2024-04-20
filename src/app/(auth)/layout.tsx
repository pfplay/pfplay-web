import { PropsWithChildren } from 'react';
import Footer from '@/shared/ui/layouts/footer.component';

const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <main className='bg-onboarding px-app'>{children}</main>
      <Footer />
    </>
  );
};

export default AuthLayout;
