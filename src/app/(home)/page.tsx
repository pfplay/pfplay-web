import Image from 'next/image';
import { UserService } from '@/api/services/User';
import ButtonLink from '@/components/shared/ButtonLink';

const HomePage = async () => {
  const { authorized, hasProfile } = await UserService.getProfileRegisteredStatus();

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
        href={!authorized ? '/sign-in' : !hasProfile ? '/settings/profile' : '/parties'}
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
