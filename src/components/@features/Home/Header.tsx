'use client';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

import { PFLanguage } from '@/components/@shared/@icons';
import IconMenu from '@/components/@shared/IconMenu';

import ProfileMenu from './ProfileMenu';

const Header = () => {
  const session = useSession();

  return (
    <header className='fixed top-10 w-full min-w-laptop flex justify-between items-center px-[120px] py-0 z-20'>
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
