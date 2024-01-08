import Image from 'next/image';
import { useAppRouter } from '@/components/shared/Router/useAppRouter';
import Button from '@/components/shared/atoms/Button';
import Typography from '@/components/shared/atoms/Typography';
import { PFEdit } from '@/components/shared/icons';

type MyProfileModalBodyProps = {
  onAvatarSettingClick?: () => void;
};
const MyProfileModalBody = ({ onAvatarSettingClick }: MyProfileModalBodyProps) => {
  const router = useAppRouter();
  const handleClickEditButton = () => {
    // TODO: Username 정보 수정 BE integration 필요
    console.log('EditButton Clicked');
  };

  const handleClickAvatarEditButton = () => {
    router.push('/settings/avatar');
    onAvatarSettingClick?.();
  };

  return (
    <div className='gap-5 flexRow'>
      <div className='flexCol gap-9'>
        <div className='w-[108px] bg-[#1D1D1D] pointer-events-none select-none'>
          <Image
            src={'/images/Background/avatar.png'}
            alt={'profilePicture'}
            width={108}
            height={216}
          />
        </div>
        <Button size='sm' variant='outline' onClick={handleClickAvatarEditButton}>
          아바타 설정
        </Button>
      </div>
      <div className='justify-between flex-1 flexCol'>
        <div className='items-start gap-3 flexCol'>
          {/* Session에서 user 정보 받아오면 Username UserBio 설정 */}
          <div className='items-center gap-3 flexRow'>
            <Typography type='body1' className='text-white'>
              USERNAME
            </Typography>
            <div onClick={() => handleClickEditButton()} className='cursor-pointer'>
              <PFEdit />
            </div>
          </div>
          <Typography className='text-left text-white'>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia facilis tenetur sequi
            soluta provident tempora architecto inventore nam ea, consequatur temporibus
          </Typography>
        </div>
        <div className='items-center justify-between flexRow'>
          <div className='gap-10 flexRow'>
            <Typography type='detail1' className='items-center gap-2 text-gray-200 flexRow'>
              포인트
              {/* FIXME:<p> cannot appear as a descendant of <p>. */}
              <Typography as='span' type='body3'>
                76p
              </Typography>
            </Typography>
            <Typography type='detail1' className='items-center gap-2 text-gray-200 flexRow'>
              가입일
              <Typography as='span' type='body3'>
                76p
              </Typography>
            </Typography>
          </div>
          <Image
            src={'/images/ETC/rainbow.png'}
            alt='rainbow'
            width={32}
            height={32}
            className='select-none pointer-events-none'
          />
        </div>
      </div>
    </div>
  );
};

export default MyProfileModalBody;
