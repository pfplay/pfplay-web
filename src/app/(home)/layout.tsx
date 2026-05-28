import { FC, PropsWithChildren } from 'react';
import { Header } from '@/widgets/layouts';
import { Footer } from '@/widgets/layouts';

const HomeLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <Header />
      <main className='bg-onboarding px-app flexColCenter gap-[64px] tablet:gap-[92px]'>
        {children}
      </main>
      <Footer />
    </>
  );
};

export default HomeLayout;
