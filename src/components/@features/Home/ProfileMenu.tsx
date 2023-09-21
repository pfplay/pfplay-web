'use client';
import React from 'react';
import { Menu } from '@headlessui/react';
import { MenuButton } from '@/components/@shared/Menu/MenuButton';
import MenuItemPanel from '@/components/@shared/Menu/MenuItemPanel';

const ProfileMenu = () => {
  return (
    <Menu as='section' className={`relative w-fit`}>
      {({ close }) => (
        <>
          <MenuButton type='profile'>pfplay@pfplay.com</MenuButton>
          <MenuItemPanel
            menuItemConfig={[{ label: '로그아웃', onClickItem: () => console.log('로그아웃') }]}
            close={close}
            size='sm'
          />
        </>
      )}
    </Menu>
  );
};

export default ProfileMenu;
