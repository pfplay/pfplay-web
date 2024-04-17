'use client';
import Image from 'next/image';
import { useDialog } from '@/shared/ui/components/dialog/use-dialog.hook';
import Typography from '@/shared/ui/components/typography/typography.component';
import CreatePartyModalBody from './create-party-modal-body.component';

const CreatePartyRoomCard = () => {
  const { openDialog, openConfirmDialog } = useDialog();

  const handleClickBeAHostBtn = async () => {
    return await openDialog((_, onCancel) => ({
      title: '파티 개설',
      titleAlign: 'left',
      showCloseIcon: true,
      closeConfirm: openCloseConfirmDialog,
      classNames: {
        container: 'w-[800px]',
      },
      Body: () => <CreatePartyModalBody onModalClose={onCancel} />,
    }));
  };

  const openCloseConfirmDialog = async () => {
    return await openConfirmDialog({
      title: '지금까지 작성한 내용은 저장되지 않아요',
      content: '개설을 중단하시겠어요?',
      okText: '확인',
      cancelText: '취소',
    });
  };

  return (
    <button
      onClick={handleClickBeAHostBtn}
      className='appearance-none col-span-1 tablet:col-span-2 desktop:col-span-1 pt-6 bg-gray-900 rounded flexCol px-7 z-0 cursor-pointer text-start'
    >
      <div className='items-start gap-3 flexCol'>
        <Typography type='title2' className='text-red-300'>
          Be a PFPlay Host
        </Typography>
        <Typography type='detail1' className='text-gray-200'>
          원하는 테마의 파티를 자유롭게 호스트해보세요!
        </Typography>
      </div>
      <div className='flex-1 w-full flex items-center justify-center'>
        <Image src='/images/Background/bigPlus.png' alt='Party Room Add' width={60} height={60} />
      </div>
    </button>
  );
};

export default CreatePartyRoomCard;
