import { FC, PropsWithChildren } from 'react';
import Footer from '@/components/layouts/Footer';
import Header from '@/components/layouts/Header';

const HomeLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <Header withLogo />
      <main className='bg-onboarding flexColCenter gap-[92px]'>{children}</main>
      <Footer />
    </>
  );
};

export default HomeLayout;
