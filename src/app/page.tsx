import { Metadata } from 'next';
import Image from 'next/image';
import Footer from '@/components/@features/Home/Footer';
import Header from '@/components/@features/Home/Header';
import CustomLink from '@/components/@shared/CustomLink';
import { cn } from '@/utils/cn';
import { NO_AUTH_ROUTES } from '@/utils/routes';

export const metadata: Metadata = {
  title: 'PFPlay',
  description: 'Generated by create next app',
  icons: {
    icon: '/favicon.ico',
  },
};

const HomePage = () => {
  return (
    <>
      <Header />
      <main className={cn('min-w-laptop bg-onboarding flexColCenter gap-[92px]')}>
        <Image
          src='/logos/wordmark_medium_white.svg'
          width={297.24}
          height={72}
          alt='logo'
          priority
        />
        <CustomLink
          href={NO_AUTH_ROUTES.SIGN_IN.index}
          linkTitle='Let your PFP Play'
          className='px-[99px]'
        />
      </main>
      <Footer />
    </>
  );
};

export default HomePage;
