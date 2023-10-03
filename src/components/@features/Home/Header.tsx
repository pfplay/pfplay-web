'use client';
import { useSession } from 'next-auth/react';

import { PFLanguage } from '@/components/@shared/@icons';
import IconMenu from '@/components/@shared/IconMenu';

import ProfileMenu from './ProfileMenu';

const Header = () => {
  const session = useSession();

  return (
    <header className='absolute top-10 w-full min-w-laptop flex justify-end items-center px-[120px] py-0 z-20'>
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
