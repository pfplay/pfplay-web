import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import { Menu } from '@headlessui/react';
import MenuButton from '@/components/@shared/@atoms/Menu/MenuButton';
import MenuItemPanel from '@/components/@shared/@atoms/Menu/MenuItemPanel';

interface ProfileMenuProps {
  userData: Session;
}

const ProfileMenu = ({ userData }: ProfileMenuProps) => {
  return (
    <Menu as='section' className={`relative w-fit`}>
      {({ close }) => (
        <>
          <MenuButton type='button'>{userData.user.email}</MenuButton>
          <MenuItemPanel
            menuItemConfig={[{ label: '로그아웃', onClickItem: () => signOut() }]}
            close={close}
            size='sm'
          />
        </>
      )}
    </Menu>
  );
};

export default ProfileMenu;
