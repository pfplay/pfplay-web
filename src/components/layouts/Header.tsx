'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FC } from 'react';
import ProfileMenu from '@/components/features/Profile/ProfileMenu';
import IconMenu from '@/components/shared/IconMenu';
import { PFLanguage } from '@/components/shared/icons';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { cn } from '@/utils/cn';

interface Props {
  withLogo?: boolean;
}

const Header: FC<Props> = ({ withLogo }) => {
  const session = useSession();
  const { isIntersecting: atTopOfPage, setRef: setTopElRef } = useIntersectionObserver({
    threshold: 0.1,
  });

  return (
    <>
      <div ref={setTopElRef} />

      <header
        className={cn(
          'fixed top-0 w-full h-[var(--header-height)] flex items-center px-app pt-10 pb-6 bg-transparent transition-colors z-20',
          withLogo ? 'justify-between' : 'justify-end',
          !atTopOfPage && 'bg-black'
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
              { label: 'English', onClickItem: () => console.log('English') },
              { label: '한국어', onClickItem: () => console.log('한국어') },
            ]}
          />
        </div>
      </header>
    </>
  );
};

export default Header;
