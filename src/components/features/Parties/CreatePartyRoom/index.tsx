'use client';
import Image from 'next/image';
import React, { useState } from 'react';
import Dialog from '@/components/shared/Dialog';
import Typography from '@/components/shared/atoms/Typography';
import { useDialog } from '@/hooks/useDialog';
import CreatePartyModalBody from './CreatePartyModalBody';

const CreatePartyRoom = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { openConfirmDialog } = useDialog();

  // const handleClickBeAHostBtn = async () => {
  //   return await openDialog(() => ({
  //     title: '파티 개설',
  //     titleAlign: 'left',
  //     showCloseIcon: true,
  //     classNames: {
  //       container: 'w-[800px]',
  //     },
  //     Body: () => <CreatePartyModalBody />,
  //   }));
  // };

  const handleCloseDialog = async () => {
    const confirmed = await openConfirmDialog({
      title: '지금까지 작성한 내용은 저장되지 않아요\n 개설을 중단하시겠어요?',
      okText: '확인',
      cancelText: '취소',
    });

    if (confirmed) {
      setDialogOpen(false);
    }

    // TODO: 취소버튼 누르면 openConfirmDialog만 닫히고 CreatePartyModalBody는 닫히지 않음
  };

  return (
    <>
      <article
        // onClick={() => handleClickBeAHostBtn()}
        onClick={() => setDialogOpen(true)}
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
      {dialogOpen && (
        <Dialog
          open={dialogOpen}
          title='파티 개설'
          titleAlign='left'
          classNames={{ container: 'w-[800px]' }}
          Body={<CreatePartyModalBody />}
          showCloseIcon
          onClose={() => handleCloseDialog()}
        />
      )}
    </>
  );
};

export default CreatePartyRoom;
