'use client';

import { Menu } from '@headlessui/react';
import MenuButton from '@/components/@shared/@atoms/Menu/MenuButton';
import MenuItemPanel from '@/components/@shared/@atoms/Menu/MenuItemPanel';

const ProfileMenu = () => {
  return (
    <Menu as='section' className={`relative w-fit`}>
      {({ close }) => (
        <>
          {/* // TODO: Get the user info from session and display email in MenuButton component */}
          <MenuButton type='button'>pfplay@pfplay.com</MenuButton>
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
