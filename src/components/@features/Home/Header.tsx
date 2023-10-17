'use client';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

import { useEffect, useState } from 'react';
import { PFLanguage } from '@/components/@shared/@icons';
import IconMenu from '@/components/@shared/IconMenu';

import { cn } from '@/utils/cn';
import ProfileMenu from './ProfileMenu';

const HEADER_HEIGHT = 100;

const Header = () => {
  const session = useSession();
  const [scrolled, setScrolled] = useState<boolean>(false);

  const handleScroll = () => {
    const offset = window.scrollY;
    if (offset > HEADER_HEIGHT) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 w-full min-w-laptop flex justify-between items-center px-[120px] pt-10 pb-6 bg-transparent transition-colors z-20',
        scrolled && 'bg-black'
      )}
    >
      <Image
        src='/images/Logo/wordmark_small_white.png'
        width={124}
        height={30}
        alt='Pfplay Logo'
        priority
      />
      <div className='items-center gap-6 flexRow'>
        {session.data && <ProfileMenu />}
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
  );
};

export default Header;
