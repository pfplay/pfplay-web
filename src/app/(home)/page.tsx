import Image from 'next/image';
import ButtonLink from '@/components/shared/ButtonLink';
import { AppLink } from '@/components/shared/Router/AppLink';

const HomePage = () => {
  return (
    <>
      <AppLink href='/parties/[id]' path={{ id: 1 }}>
        zz
      </AppLink>
      <Image
        src='/images/Logo/wordmark_medium_white.png'
        width={297.24}
        height={72}
        alt='logo'
        priority
      />
      <ButtonLink
        href='/sign-in'
        linkTitle='Let your PFP Play'
        classNames={{
          button: 'w-[360px]',
        }}
        size='xl'
      />
    </>
  );
};

export default HomePage;
