import Image from 'next/image';
import { ReactNode } from 'react';
import { PartyroomCrew } from '@/shared/api/http/types/partyrooms';
import { DisplayOptionMenuOnHoverListener } from '@/shared/ui/components/display-option-menu-on-hover-listener';
import { MenuItem, MenuItemPanelSize } from '@/shared/ui/components/menu';
import { Typography } from '@/shared/ui/components/typography';
import { SuffixType } from './model/user-list-item.model';

export type UserListItemType = Partial<PartyroomCrew>;

type UserListItemProps = {
  userListItemConfig: UserListItemType;
  menuItemList?: MenuItem[];
  menuItemPanelSize?: MenuItemPanelSize;
  suffix?: {
    type: SuffixType;
    Component: ReactNode;
  };
  menuDisabled?: boolean;
};

const UserListItem = ({
  userListItemConfig,
  menuItemList,
  menuItemPanelSize,
  suffix,
  menuDisabled,
}: UserListItemProps) => {
  const innerElement = (
    <div className='relative w-full flexRow justify-between items-center py-2 px-4 rounded-[4px]'>
      <div className='flexRow justify-center items-center gap-2'>
        <Image
          src={userListItemConfig.avatarIconUri || '/images/ETC/monkey.png'}
          alt={userListItemConfig.nickname || ''}
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
  );

  if (!menuItemList?.length || suffix?.type === 'button' || menuDisabled) {
    return innerElement;
  }

  return (
    <DisplayOptionMenuOnHoverListener
      menuConfig={menuItemList}
      menuPositionClassName='top-[8px] right-[12px]'
      menuItemPanelSize={menuItemPanelSize}
      disabled={menuDisabled}
    >
      {innerElement}
    </DisplayOptionMenuOnHoverListener>
  );
};

export default UserListItem;
