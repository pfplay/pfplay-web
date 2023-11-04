'use client';
import Image from 'next/image';
import Typography from '@/components/shared/atoms/Typography';
import { PFHeadset } from '@/components/shared/icons';
import { useDialog } from '@/hooks/useDialog';
import MyProfileModalBody from './MyProfileModalBody';

interface PartiesSideBarProps {
  setDrawerOpen: (open: boolean) => void;
}

const PartiesSideBar = ({ setDrawerOpen }: PartiesSideBarProps) => {
  const { openDialog } = useDialog();

  const handleClickProfileButton = () => {
    return openDialog(() => ({
      title: '내 프로필 ',
      titleAlign: 'left',
      titleType: 'title2',
      showCloseIcon: true,
      classNames: {
        container: 'min-w-[620px] py-7 px-10 bg-black',
      },
      Body: MyProfileModalBody,
    }));
  };

  return (
    <div className='fixed top-1/2 left-10 transform -translate-y-1/2 flexCol justify-between gap-10 px-1 py-6 bg-[#0E0E0E] rounded z-10'>
      {/* TODO: 프로필 이미지로 변경, href 추가 */}
      <div onClick={handleClickProfileButton} className='gap-2 cursor-pointer flexColCenter'>
        <Image
          src='/images/Background/profile.png' // TODO: user session에서 프로필 받아와 변경
          alt='profile' // TODO: user session에서 프로필 받아와 변경
          width={48}
          height={48}
          className='rounded-[100%] border-gray-500 border border-solid w-[48px] h-[48px]'
        />
        <Typography type='caption1' className='text-gray-200'>
          내 프로필
        </Typography>
      </div>
      <div onClick={() => setDrawerOpen(true)} className='flexColCenter gap-2 cursor-pointer '>
        <PFHeadset width={36} height={36} />
        <Typography type='caption1' className='text-gray-200'>
          플레이리스트
        </Typography>
      </div>
    </div>
  );
};

export default PartiesSideBar;
