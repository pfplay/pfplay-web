import Image from 'next/image';
import React from 'react';
import { cn } from '@/lib/utils';
import Button from './@atoms/Button';
import Tag from './@atoms/Tag';
import Typography from './@atoms/Typography';
import DisplayOptionMenuOnHoverListener from './DisplayOptionMenuOnHoverListener';
import { MenuItem } from './Menu';

const exampleMenuConfig: Array<MenuItem> = [
  { onClickItem: () => console.log('삭제 clicked'), label: '삭제' },
  { onClickItem: () => console.log('꿀 clicked'), label: '꿀' },
  { onClickItem: () => console.log('킥 clicked'), label: '킥' },
  { onClickItem: () => console.log('밴 clicked'), label: '밴' },
];

type ProfilePanelUserConfig = {
  username: string;
  src: string;
  alt?: string;
};

type ProfilePanelWithTag = {
  suffixType: 'tag';
  suffixValue: string;
};

type ProfilePanelWithButton = {
  suffixType: 'button';
  suffixValue: string;
  onButtonClick: () => void;
};

type ProfilePanelProps = {
  order?: string;
  size?: 'sm' | 'md';
  variant?: 'basic' | 'outlineAccent' | 'filled';
  userConfig: ProfilePanelUserConfig;
} & Partial<ProfilePanelWithTag | ProfilePanelWithButton>;

const ProfilePanel = ({
  userConfig: { username, src, alt },
  size = 'sm',
  variant = 'basic',
  order,
  ...suffixProps
}: ProfilePanelProps) => {
  if (size === 'md') {
    return (
      <DisplayOptionMenuOnHoverListener
        menuConfig={exampleMenuConfig}
        menuPositionStyle='top-[8px] right-[12px]'
        listenerDisabled={suffixProps.suffixType === 'button'}
      >
        {() => (
          <div
            className={cn(
              'relative w-full flexRow justify-between items-center py-2 px-4 rounded-[4px]'
            )}
          >
            <ProfilePanelBody src={src} username={username} alt={alt} />

            {suffixProps && <ProfilePanelSuffix suffixProps={suffixProps} />}
          </div>
        )}
      </DisplayOptionMenuOnHoverListener>
    );
  }

  return (
    <div
      className={cn(
        'relative w-fit flexRow justify-start items-center gap-3 py-2 px-4 rounded-[4px]',
        variant === 'outlineAccent' && 'border border-red-300 rounded-[40px]',
        variant === 'filled' && 'bg-gray-800'
      )}
    >
      {order && (
        <Typography type='detail2' className='text-gray-200'>
          {order}
        </Typography>
      )}

      <ProfilePanelBody src={src} username={username} alt={alt} />

      {suffixProps && <ProfilePanelSuffix suffixProps={suffixProps} smallSize />}
    </div>
  );
};

export default ProfilePanel;

const ProfilePanelBody = ({ src, username, alt }: ProfilePanelUserConfig) => {
  return (
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
  );
};

const ProfilePanelSuffix = ({
  smallSize = false,
  suffixProps,
}: {
  smallSize?: boolean;
  suffixProps: Partial<ProfilePanelWithTag | ProfilePanelWithButton>;
}) => {
  return (
    <>
      {suffixProps?.suffixType === 'tag' && <Tag value='Tag' variant='filled' />}
      {!smallSize && suffixProps?.suffixType === 'button' && (
        <Button variant='outline' color='secondary' onClick={suffixProps?.onButtonClick} size='sm'>
          {suffixProps?.suffixValue}
        </Button>
      )}
    </>
  );
};
