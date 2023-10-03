import Image from 'next/image';

import { cn } from '@/utils/cn';
import Button from './@atoms/Button';
import { MenuItem } from './@atoms/Menu/MenuItemPanel';
import Tag from './@atoms/Tag';
import Typography from './@atoms/Typography';
import DisplayOptionMenuOnHoverListener from './DisplayOptionMenuOnHoverListener';

export type UserListItemType = {
  id: number;
  username: string;
  src: string;
  alt?: string;
};

type UserListItemWithTag = {
  suffixType: 'tag';
  suffixValue: string;
};

type UserListItemWithButton = {
  suffixType: 'button';
  suffixValue: string;
  onButtonClick: (id?: number) => void; // 사용처 정해지면 param 추가/제거 및 타입 수정
};

type UserListItemProps = {
  userListItemConfig: UserListItemType;
  menuItemList: MenuItem[];
} & (UserListItemWithTag | UserListItemWithButton);

const UserListItem = ({ userListItemConfig, menuItemList, ...suffixProps }: UserListItemProps) => {
  return (
    <DisplayOptionMenuOnHoverListener
      menuConfig={menuItemList}
      menuPositionStyle='top-[8px] right-[12px]'
      listenerDisabled={suffixProps.suffixType === 'button'}
    >
      {() => (
        <div
          className={cn(
            'relative w-full flexRow justify-between items-center py-2 px-4 rounded-[4px]'
          )}
        >
          <div className={cn('flexRow justify-center items-center gap-2')}>
            <Image
              src={userListItemConfig.src ?? '/images/ETC/monkey.png'}
              alt={userListItemConfig?.alt ?? userListItemConfig.username}
              width={32}
              height={32}
              className='w-8 h-8 rounded-full'
            />
            <Typography type='detail1' className='text-white'>
              {userListItemConfig.username}
            </Typography>
          </div>

          {suffixProps.suffixType === 'tag' && (
            <Tag value={suffixProps.suffixValue} variant='filled' />
          )}
          {suffixProps.suffixType === 'button' && (
            <Button
              variant='outline'
              color='secondary'
              onClick={() => suffixProps.onButtonClick(userListItemConfig.id)}
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
