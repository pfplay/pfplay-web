import { signOut } from 'next-auth/react';
import { Menu } from '@headlessui/react';
import MenuButton from '@/components/shared/atoms/menu/menu-button.component';
import MenuItemPanel from '@/components/shared/atoms/menu/menu-item-panel.component';

interface ProfileMenuProps {
  email: string;
}

const ProfileMenu = ({ email }: ProfileMenuProps) => {
  return (
    <Menu as='section' className={`relative w-fit`}>
      {({ close }) => (
        <>
          <MenuButton type='button'>{email}</MenuButton>
          <MenuItemPanel
            menuItemConfig={[
              {
                label: '로그아웃',
                onClickItem: () => signOut({ callbackUrl: '/' }),
              },
            ]}
            close={close}
            size='sm'
          />
        </>
      )}
    </Menu>
  );
};

export default ProfileMenu;
