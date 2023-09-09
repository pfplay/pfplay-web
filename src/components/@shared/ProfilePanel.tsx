import Image from 'next/image';
import React, { useState } from 'react';
import useClickOutside from '@/hooks/useClickOutside';
import { cn } from '@/lib/utils';
import Button from './@atoms/Button';
import Tag from './@atoms/Tag';
import Typography from './@atoms/Typography';
import Menu, { MenuItem } from './Menu';

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

type ProfilePanelCommenProps = {
  order?: string;
  size?: 'sm' | 'md';
  variant?: 'basic' | 'outlineAccent' | 'filled';
  userConfig: ProfilePanelUserConfig;
};

type ProfilePanelProps = ProfilePanelCommenProps &
  Partial<ProfilePanelWithTag | ProfilePanelWithButton>;

const ProfilePanel = ({
  userConfig: { username, src, alt },
  size = 'sm',
  variant = 'basic',
  order,
  ...suffixProps
}: ProfilePanelProps) => {
  const [isHover, setIsHover] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuIconClick = () => {
    setIsMenuOpen(true);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
    setIsHover(false);
  };

  const menuRef = useClickOutside<HTMLDivElement>(handleMenuClose);

  if (size === 'md') {
    return (
      <div
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => !isMenuOpen && setIsHover(false)}
        className={cn(
          'relative w-full flexRow justify-between items-center py-2 px-4 rounded-[4px]'
        )}
      >
        <ProfilePanelBody src={src} username={username} alt={alt} />

        <ProfilePanelSuffix {...suffixProps} />

        <div
          className={cn(
            'absolute inset-0 bg-transparent',
            isHover && 'bg-gradient-to-r from-transparent to-gray-900'
          )}
        />

        {isHover && (
          <Menu
            /* TODO: Menu config 정해지면 optionMenuconfig props 대체 */
            optionMenuConfig={exampleMenuConfig}
            onMenuIconClick={handleMenuIconClick}
            onMenuClose={handleMenuClose}
            menuContainerStyle='absolute top-[8px] right-[12px]'
            ref={menuRef}
            size='md'
          />
        )}
      </div>
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

      <ProfilePanelSuffix {...suffixProps} />
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

const ProfilePanelSuffix = (suffixProps: Partial<ProfilePanelWithTag | ProfilePanelWithButton>) => {
  return (
    <>
      {suffixProps?.suffixType === 'tag' && <Tag value='Tag' variant='filled' />}
      {suffixProps?.suffixType === 'button' && (
        <Button variant='outline' color='secondary' onClick={suffixProps?.onButtonClick} size='sm'>
          {suffixProps?.suffixValue}
        </Button>
      )}
    </>
  );
};
