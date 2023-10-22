import { Metadata } from 'next';
import Image from 'next/image';
import Footer from '@/components/features/Home/Footer';
import Header from '@/components/features/Home/Header';
import CustomLink from '@/components/shared/CustomLink';
import { cn } from '@/utils/cn';
import { PAGE_METADATA, ROUTES } from '@/utils/routes';

export const metadata: Metadata = PAGE_METADATA.HOME.index;

const HomePage = () => {
  return (
    <>
      <Header />
      <main className={cn('min-w-laptop bg-onboarding flexColCenter gap-[92px]')}>
        <Image
          src='/images/Logo/wordmark_medium_white.png'
          width={297.24}
          height={72}
          alt='logo'
          priority
        />
        <CustomLink
          href={ROUTES.AUTH.SIGN_IN.index}
          linkTitle='Let your PFP Play'
          classNames={{
            button: 'px-[99px]',
          }}
          size='xl'
        />
      </main>
      <Footer />
    </>
  );
};

export default HomePage;
