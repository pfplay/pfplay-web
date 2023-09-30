'use client';
import Image from 'next/image';
import Typography from '@/components/@shared/@atoms/Typography';
import Icons from '@/components/__legacy__/Icons';
import { useDialog } from '@/hooks/useDialog';
import ProfileModalBody from './ProfileModalBody';

const PartiesSideBar = () => {
  const { openDialog } = useDialog();

  const handleClickProfileButton = () => {
    return openDialog(() => ({
      title: '내 프로필 ',
      titleAlign: 'left',
      showCloseIcon: true,
      classNames: {
        container: 'min-w-[620px] py-7 px-10 bg-black',
        titleType: 'title2',
      },
      Body: () => <ProfileModalBody />,
    }));
  };

  return (
    <div className='absolute top-1/2 left-10 transform -translate-y-1/2 flexCol justify-between gap-10 px-1 py-6 bg-[#0E0E0E] rounded z-20'>
      {/* TODO: 프로필 이미지로 변경, href 추가 */}
      <div onClick={handleClickProfileButton} className='gap-2 cursor-pointer flexColCenter'>
        <Image
          src='/image/profile.png' // TODO: user session에서 프로필 받아와 변경
          alt='profile' // TODO: user session에서 프로필 받아와 변경
          width={48}
          height={48}
          className='rounded-[100%] border-gray-500 border border-solid w-[48px] h-[48px]'
        />
        <Typography type='caption1' className='text-gray-200'>
          내 프로필
        </Typography>
      </div>
      <div className='gap-2 cursor-pointer flexColCenter'>
        <Icons.headset width={36} height={36} />
        <Typography type='caption1' className='text-gray-200'>
          플레이리스트
        </Typography>
      </div>
    </div>
  );
};

export default PartiesSideBar;
