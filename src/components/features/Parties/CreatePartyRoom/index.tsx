'use client';
import Image from 'next/image';
import React from 'react';
import Typography from '@/components/shared/atoms/Typography';
import { useDialog } from '@/hooks/useDialog';
import CreatePartyModalBody from './CreatePartyModalBody';

const CreatePartyRoom = () => {
  const { openDialog } = useDialog();

  const handleClickBeAHostBtn = () => {
    return openDialog(() => ({
      title: '파티 개설',
      titleAlign: 'left',
      showCloseIcon: true,
      classNames: {
        container: 'w-[800px]',
      },
      Body: () => <CreatePartyModalBody />,
    }));
  };

  return (
    <article
      onClick={() => handleClickBeAHostBtn()}
      className='gap-10 pt-6 bg-gray-900 rounded cursor-pointer flexCol px-7 z-0 pb-[50px]'
    >
      <div className='items-start gap-3 flexCol'>
        <Typography type='title2' className='text-red-300'>
          Be a PFPlay Host
        </Typography>
        <Typography type='detail1' className='text-gray-200'>
          원하는 테마의 파티를 자유롭게 호스트해보세요!
        </Typography>
      </div>
      <div className='flex items-center justify-center'>
        <Image src='/images/Background/bigPlus.png' alt='Party Room Add' width={60} height={60} />
      </div>
    </article>
  );
};

export default CreatePartyRoom;
