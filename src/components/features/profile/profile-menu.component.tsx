import { signOut } from 'next-auth/react';
import { Menu } from '@headlessui/react';
import { MenuButton } from '@/shared/ui/components/menu';
import { MenuItemPanel } from '@/shared/ui/components/menu';

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
