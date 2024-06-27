'use client';
import Image from 'next/image';
import { Language } from '@/shared/lib/localization/constants';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useLang } from '@/shared/lib/localization/lang.context';
import { useDialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';
import CreatePartyroomForm from './form.component';

const PartyroomCreateCard = () => {
  const t = useI18n();
  const lang = useLang();
  const { openDialog, openConfirmDialog } = useDialog();

  const handleClickBeAHostBtn = () => {
    return openDialog((_, onCancel) => ({
      title: '파티 개설',
      titleAlign: 'left',
      showCloseIcon: true,
      closeConfirm: openCloseConfirmDialog,
      classNames: {
        container: lang === Language.Ko ? 'w-[800px]' : 'w-[900px]',
      },
      Body: () => <CreatePartyroomForm onModalClose={onCancel} />,
    }));
  };

  const openCloseConfirmDialog = () => {
    return openConfirmDialog({
      title: '지금까지 작성한 내용은 저장되지 않아요',
      content: '개설을 중단하시겠어요?',
    });
  };

  return (
    <button
      onClick={handleClickBeAHostBtn}
      className='appearance-none col-span-1 tablet:col-span-2 desktop:col-span-1 pt-6 bg-gray-900 rounded flexCol px-7 z-0 cursor-pointer text-start'
    >
      <div className='items-start gap-3 flexCol'>
        <Typography type='title2' className='text-red-300'>
          {t.lobby.title.be_a_host}
        </Typography>
        <Typography type='detail1' className='text-gray-200'>
          {t.lobby.para.freely_host}
        </Typography>
      </div>
      <div className='flex-1 w-full flex items-center justify-center'>
        <Image src='/images/Background/bigPlus.png' alt='Party Room Add' width={60} height={60} />
      </div>
    </button>
  );
};

export default PartyroomCreateCard;
