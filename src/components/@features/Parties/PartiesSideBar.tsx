'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { PFHeadset } from '@/components/@shared/@icons';
import { NO_AUTH_ROUTES } from '@/utils/routes';
import MyProfileModal from './MyProfileModal';

const PartiesSideBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='flex flex-col justify-between absolute py-[28px] top-1/2 left-[40px] w-[88px] h-[224px] bg-gray-900 border-solid border-gray-500 border mr-[24px] transform -translate-y-1/2'>
      {/* TODO: 프로필 이미지로 변경, href 추가 */}
      <div onClick={() => setIsOpen(true)}>
        <div className='cursor-pointer flex flex-col justify-center items-center gap-1'>
          <Image
            src='https://picsum.photos/200/300'
            alt='profile'
            width='48'
            height='48'
            className='rounded-[100%] border-gray-500 border border-solid w-[48px] h-[48px]'
          />
          <p className='text-gray-300 text-[12px]'>내 프로필</p>
        </div>
      </div>
      <Link href={NO_AUTH_ROUTES.HOME.index} passHref>
        <div className='flex flex-col justify-center items-center gap-1'>
          <PFHeadset />
          <p className='text-gray-300 text-[12px]'>플레이 리스트</p>
        </div>
      </Link>
      <MyProfileModal isOpen={isOpen} onModalClose={() => setIsOpen(false)} />
    </div>
  );
};

export default PartiesSideBar;
