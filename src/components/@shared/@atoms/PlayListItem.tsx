'use client';
import Image from 'next/image';
import React, { useState } from 'react';
import useClickOutside from '@/hooks/useClickOutside';
import { cn } from '@/lib/utils';
import Typography from './Typography';
import Menu, { MenuItem } from '../Menu';

interface PlayListItemProps {
  title: string;
  duration: string;
  src?: string;
  alt: string;
}

const exampleMenuConfig: Array<MenuItem> = [
  { onClickItem: () => console.log('삭제 clicked'), label: '삭제' },
  { onClickItem: () => console.log('꿀 clicked'), label: '꿀' },
  { onClickItem: () => console.log('킥 clicked'), label: '킥' },
  { onClickItem: () => console.log('밴 clicked'), label: '밴' },
];

const PlayListItem = ({ title, duration, src, alt }: PlayListItemProps) => {
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

  return (
    <div
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => !isMenuOpen && setIsHover(false)}
      className='relative w-full max-w-[332px] py-3 flexRow justify-start rounded'
    >
      {/* TODO: 기본 Thumbnail 이미지 정해지면 대체  */}
      <div className='w-[80px] h-[44px] select-none pointer-events-none'>
        <Image
          priority
          src={src ?? '/image/thumbnail.png'}
          alt={alt ?? ''}
          width={80}
          height={44}
          className='w-full h-full object-contain'
        />
      </div>
      <div className='flexCol w-9/12 pl-3'>
        <Typography type='caption1' overflow='ellipsis' className='text-gray-50'>
          {title}
        </Typography>
        <Typography type='caption1' className='self-end text-gray-400'>
          {duration}
        </Typography>
      </div>
      <div
        className={cn(
          'absolute inset-0  bg-transparent',
          isHover && 'bg-gradient-to-r from-transparent to-gray-900'
        )}
      />

      {isHover && (
        <>
          {/* TODO: Menu config 정해지면 optionMenuconfig props 대체 */}
          <Menu
            optionMenuConfig={exampleMenuConfig}
            onMenuIconClick={handleMenuIconClick}
            onMenuClose={handleMenuClose}
            menuContainerStyle='absolute right-0 opacity-100'
            ref={menuRef}
            size='md'
          />
        </>
      )}
    </div>
  );
};

export default PlayListItem;
