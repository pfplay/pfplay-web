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
  const { openDialog, openAlertDialog } = useDialog();

  const handleClickBeAHostBtn = () => {
    openDialog((_, onCancel) => ({
      title: t.createparty.title.create_party,
      titleAlign: 'left',
      showCloseIcon: true,
      // closeConfirm: () => {
      //   const [title, content] = t.createparty.para.cancel_confirm.split('\n');
      //   return openConfirmDialog({
      //     title,
      //     content,
      //   });
      // },
      classNames: {
        container: lang === Language.Ko ? 'w-[800px]' : 'w-[900px]',
      },
      Body: () => <CreatePartyroomForm onModalClose={onCancel} />,
    }));

    openAlertDialog({
      content: 'Partyroom creation is Comming Soon :)',
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
