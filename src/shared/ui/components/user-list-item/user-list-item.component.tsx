import Image from 'next/image';
import { Participant } from '@/shared/api/http/types/partyroom';
import { Button } from '@/shared/ui/components/button';
import { DisplayOptionMenuOnHoverListener } from '@/shared/ui/components/display-option-menu-on-hover-listener';
import { MenuItem, MenuItemPanelSize } from '@/shared/ui/components/menu';
import { Tag } from '@/shared/ui/components/tag';
import { Typography } from '@/shared/ui/components/typography';

export type UserListItemType = Partial<Participant>;

export type UserListItemWithTag = {
  suffixType: 'tag';
  suffixValue?: string;
};

export type UserListItemWithButton = {
  suffixType: 'button';
  suffixValue: string;
  onButtonClick: (id?: number) => void; // 사용처 정해지면 param 추가/제거 및 타입 수정
};

export type DefaultUserListItem = {
  suffixType: 'default';
};

type UserListItemProps = {
  userListItemConfig: UserListItemType;
  menuItemList: MenuItem[];
  menuItemPanelSize?: MenuItemPanelSize;
} & (UserListItemWithTag | UserListItemWithButton | DefaultUserListItem);

const UserListItem = ({
  userListItemConfig,
  menuItemList,
  menuItemPanelSize,
  ...suffixProps
}: UserListItemProps) => {
  return (
    <DisplayOptionMenuOnHoverListener
      menuConfig={menuItemList}
      menuPositionStyle='top-[8px] right-[12px]'
      listenerDisabled={suffixProps.suffixType === 'button'}
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

          {suffixProps.suffixType === 'tag' && suffixProps.suffixValue && (
            <Tag value={suffixProps.suffixValue} variant='filled' />
          )}
          {suffixProps.suffixType === 'button' && (
            <Button
              variant='outline'
              color='secondary'
              onClick={() => suffixProps.onButtonClick(userListItemConfig.memberId)}
              size='sm'
            >
              {suffixProps.suffixValue}
            </Button>
          )}
        </div>
      )}
    </DisplayOptionMenuOnHoverListener>
  );
};

export default UserListItem;
