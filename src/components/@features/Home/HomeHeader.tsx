'use client';
import React from 'react';
import ProfileMenu from './ProfileMenu';
import IconMenu from '../../@shared/IconMenu';
import Icons from '../../__legacy__/Icons';

const HomeHeader = () => {
  return (
    <header className='absolute top-10 right-[120px] w-full flex justify-end items-center gap-6 z-20'>
      <ProfileMenu />
      <IconMenu
        MenuButtonIcon={<Icons.worldglobe />}
        menuItemPanel={{ size: 'sm' }}
        menuItemConfig={[
          { label: 'English', onClickItem: () => console.log('English') },
          { label: '한국어', onClickItem: () => console.log('한국어') },
        ]}
      />
    </header>
  );
};

export default HomeHeader;
