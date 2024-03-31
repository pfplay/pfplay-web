'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FC } from 'react';
import ProfileMenu from '@/components/features/profile/profile-menu.component';
import IconMenu from '@/components/shared/icon-menu.component';
import { PFLanguage } from '@/components/shared/icons';
import { Language } from '@/constants/lang';
import { useDictionary } from '@/context/dictionary.context';
import { useChangeLanguage } from '@/hooks/use-change-language.hook';
import useIntersectionObserver from '@/hooks/use-intersection-observer.hook';
import { cn } from '@/utils/cn';

interface Props {
  withLogo?: boolean;
}

const Header: FC<Props> = ({ withLogo }) => {
  const session = useSession();
  const { isIntersecting: atTopOfPage, setRef: setTopElRef } = useIntersectionObserver({
    threshold: 0.1,
  });

  const dic = useDictionary();
  const changeLanguage = useChangeLanguage();

  return (
    <>
      <div ref={setTopElRef} />

      <header
        className={cn(
          'fixed top-0 w-full h-[var(--header-height)] flex items-center px-app pt-10 pb-6 transition-colors z-20',
          withLogo ? 'justify-between' : 'justify-end',
          atTopOfPage ? 'bg-transparent' : 'bg-black'
        )}
      >
        {withLogo && (
          <Link href='/'>
            <Image
              src='/images/Logo/wordmark_small_white.png'
              width={124}
              height={30}
              alt='Pfplay Logo'
              priority
            />
          </Link>
        )}
        <div className='items-center gap-6 flexRow'>
          {session.status === 'authenticated' && <ProfileMenu email={session.data.user.email} />}
          <IconMenu
            MenuButtonIcon={<PFLanguage />}
            menuItemPanel={{ size: 'sm' }}
            menuItemConfig={[
              {
                label: dic['common.btn.eng'],
                onClickItem: () => changeLanguage(Language.En),
              },
              {
                label: dic['common.btn.kor'],
                onClickItem: () => changeLanguage(Language.Ko),
              },
            ]}
          />
        </div>
      </header>
    </>
  );
};

export default Header;
