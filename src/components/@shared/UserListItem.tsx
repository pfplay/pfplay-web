import Image from 'next/image';
import React from 'react';
import { cn } from '@/utils/cn';
import Button from './@atoms/Button';
import Tag from './@atoms/Tag';
import Typography from './@atoms/Typography';
import DisplayOptionMenuOnHoverListener from './DisplayOptionMenuOnHoverListener';
import { MenuItem } from './Menu';

type UserListItemUserConfig = {
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
  onButtonClick: () => void; // 사용처 정해지면 param 추가/제거 및 타입 수정
};

type UserListItemProps = {
  userConfig: UserListItemUserConfig;
  menuItemList: Array<MenuItem>;
} & Partial<UserListItemWithTag | UserListItemWithButton>;

const UserListItem = ({
  userConfig: { src, username, alt },
  menuItemList,
  ...suffixProps
}: UserListItemProps) => {
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
              src={src ?? '/image/monkey.png'}
              alt={alt ?? username}
              width={32}
              height={32}
              className='w-8 h-8 rounded-full'
            />
            <Typography type='detail1' className='text-white'>
              {username}
            </Typography>
          </div>

          {suffixProps?.suffixType === 'tag' && <Tag value='Tag' variant='filled' />}
          {suffixProps?.suffixType === 'button' && (
            <Button
              variant='outline'
              color='secondary'
              onClick={suffixProps?.onButtonClick}
              size='sm'
            >
              {suffixProps?.suffixValue}
            </Button>
          )}
        </div>
      )}
    </DisplayOptionMenuOnHoverListener>
  );
};

export default UserListItem;
