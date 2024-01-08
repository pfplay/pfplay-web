import Image from 'next/image';
import ButtonLink from '@/components/shared/ButtonLink';
import { getServerAuthSession } from '@/utils/authOptions';

const HomePage = async () => {
  const session = await getServerAuthSession();
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
        href={
          !session ? '/sign-in' : !session.user.profileUpdated ? '/settings/profile' : '/parties'
        }
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
