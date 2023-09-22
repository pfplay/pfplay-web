'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import React from 'react';
import { NO_AUTH_ROUTES } from '@/utils/routes';
import ProfileMenu from './ProfileMenu';
import IconMenu from '../../@shared/IconMenu';
import Icons from '../../__legacy__/Icons';

const Header = () => {
  const session = useSession();

  return (
    <header className='absolute top-10 w-full min-w-tablet flex justify-between items-center px-[120px] py-0 z-20'>
      <Link href={NO_AUTH_ROUTES.HOME.index}>
        <Icons.logo width={124} />
      </Link>
      <div className='items-center gap-6 flexRow'>
        {session.data && <ProfileMenu />}
        <IconMenu
          MenuButtonIcon={<Icons.worldglobe />}
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
