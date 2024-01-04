import Image from 'next/image';
import { getServerSession } from 'next-auth';
import ButtonLink from '@/components/shared/ButtonLink';

const HomePage = async () => {
  const session = await getServerSession();
  return (
    <>
      <Image
        src='/images/Logo/wordmark_medium_white.png'
        width={297.24}
        height={72}
        alt='logo'
        priority
      />
      <ButtonLink
        href={session ? '/parties' : '/sign-in'}
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
