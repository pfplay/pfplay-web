import Image from 'next/image';
import { ReactNode } from 'react';
import { Participant } from '@/shared/api/http/types/partyrooms';
import { DisplayOptionMenuOnHoverListener } from '@/shared/ui/components/display-option-menu-on-hover-listener';
import { MenuItem, MenuItemPanelSize } from '@/shared/ui/components/menu';
import { Typography } from '@/shared/ui/components/typography';
import { SuffixType } from './model/user-list-item.model';

export type UserListItemType = Partial<Participant>;

type UserListItemProps = {
  userListItemConfig: UserListItemType;
  menuItemList: MenuItem[];
  menuItemPanelSize?: MenuItemPanelSize;
  suffix?: {
    type: SuffixType;
    Component: ReactNode;
  };
};

const UserListItem = ({
  userListItemConfig,
  menuItemList,
  menuItemPanelSize,
  suffix,
}: UserListItemProps) => {
  return (
    <DisplayOptionMenuOnHoverListener
      menuConfig={menuItemList}
      menuPositionStyle='top-[8px] right-[12px]'
      listenerDisabled={suffix?.type === 'button'}
      menuItemPanelSize={menuItemPanelSize}
    >
      {() => (
        <div className='relative w-full flexRow justify-between items-center py-2 px-4 rounded-[4px]'>
          <div className='flexRow justify-center items-center gap-2'>
            <Image
              src={userListItemConfig.avatarIconUri ?? '/images/ETC/monkey.png'}
              alt={userListItemConfig.nickname ?? ''}
              width={32}
              height={32}
              className='w-8 h-8 rounded-full'
            />
            <Typography type='detail1' className='text-white'>
              {userListItemConfig.nickname}
            </Typography>
          </div>

          {suffix && suffix.Component}
        </div>
      )}
    </DisplayOptionMenuOnHoverListener>
  );
};

export default UserListItem;
