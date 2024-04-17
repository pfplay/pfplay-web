import Image from 'next/image';
import { getServerDictionary } from '@/entities/localization';
import { getServerAuthSession } from '@/shared/api/next-auth-options';
import ButtonLink from '@/shared/ui/components/button-link/button-link.component';

const HomePage = async () => {
  const session = await getServerAuthSession();
  const dic = await getServerDictionary();
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
        href={(() => {
          if (!session) return '/sign-in';
          if (!session.user.profileUpdated) return '/settings/profile';
          return '/parties';
        })()}
        linkTitle={dic['onboard.btn.pfp_play']}
        classNames={{
          button: 'w-[360px]',
        }}
        size='xl'
      />
    </>
  );
};

export default HomePage;
