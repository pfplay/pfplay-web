import { FC, PropsWithChildren } from 'react';
import Footer from '@/components/layouts/footer.component';
import Header from '@/components/layouts/header.component';

const HomeLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <Header withLogo />
      <main className='bg-onboarding px-app flexColCenter gap-[64px] tablet:gap-[92px]'>
        {children}
      </main>
      <Footer />
    </>
  );
};

export default HomeLayout;
