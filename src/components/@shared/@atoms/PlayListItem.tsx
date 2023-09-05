'use client';
import Image from 'next/image';
import React, { useState } from 'react';
import Icons from '@/components/__legacy__/Icons';
import useClickOutside from '@/hooks/useClickOutside';
import { cn } from '@/lib/utils';
import Typography from './Typography';
import Menu, { MenuItem } from '../Menu';

interface PlayListItemProps {
  id: number;
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

const PlayListItem = ({ id, title, duration, src, alt }: PlayListItemProps) => {
  const [isHover, setIsHover] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuIconClick = () => {
    setIsMenuOpen(true);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
    setIsHover(false);
  };

  const handlePlayBtnClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, id: number) => {
    e.stopPropagation();
    console.log(`id: ${id}는 향후 비디오 재생 api 연결에 사용될 예정입니다.`);
  };

  const menuRef = useClickOutside<HTMLDivElement>(handleMenuClose);

  return (
    <div
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => !isMenuOpen && setIsHover(false)}
      className='relative w-full flexRow justify-start rounded gap-[12px]'
    >
      {/* TODO: 기본 Thumbnail 이미지 정해지면 대체  */}
      <div className='relative w-[80px] h-[44px] bg-gray-700'>
        <Image
          priority
          src={src ?? '/image/thumbnail.png'}
          alt={alt ?? ''}
          width={80}
          height={44}
          className={cn('w-full h-full object-contain select-none', isHover && 'opacity-60')}
        />
        {isHover && (
          <div
            onClick={(e) => handlePlayBtnClick(e, id)}
            className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-50'
          >
            <Icons.play />
          </div>
        )}
      </div>
      <div className='flexCol flex-1 min-w-0 select-none'>
        <Typography type='caption1' overflow='ellipsis' className='text-gray-50'>
          {title}
        </Typography>
        <Typography type='caption1' className='self-end text-gray-400'>
          {duration}
        </Typography>
      </div>

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
          menuContainerStyle='absolute top-[5px] right-0'
          ref={menuRef}
          size='md'
        />
      )}
    </div>
  );
};

export default PlayListItem;
