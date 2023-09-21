'use client';
import React from 'react';
import OptionMenu from '@/components/@shared/Menu/Menu';
import { mockMenuConfig } from '@/constants/__mock__/mockMenuConfig';

const ProfileMenu = () => {
  // const [menuOpen, setMenuOpen] = useState(false);

  return (
    <OptionMenu
      // Button={
      //   <_Menu.Button
      //     onClick={() => {
      //       setMenuOpen(!menuOpen);
      //     }}
      //     className={'flex items-center gap-2 text-gray-50 p-2'}
      //   >
      //     pfplayer@pfplay.co
      //   </_Menu.Button>
      // }
      // onMenuClose={() => setMenuOpen(false)}
      optionMenuConfig={mockMenuConfig}
      // optionMenuConfig={[{ label: '로그아웃', onClickItem: () => console.log('logout clicked') }]}
      // size='sm'
    />
  );
};

export default ProfileMenu;
