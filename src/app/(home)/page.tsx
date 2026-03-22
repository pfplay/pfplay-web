'use client';

import Image from 'next/image';
import { useFetchMe } from '@/entities/me';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { ButtonLink } from '@/shared/ui/components/button-link';

const HomePage = () => {
  const t = useI18n();
  const { data: me } = useFetchMe();

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
          if (!me) return '/sign-in';
          if (!me.profileUpdated) return '/settings/profile';
          return '/parties';
        })()}
        linkTitle={t.onboard.btn.pfp_play}
        classNames={{
          button: 'w-[360px]',
        }}
        size='xl'
      />
    </>
  );
};

export default HomePage;
