import { AvatarService } from '@/api/services/Avatar';
import Button from '@/components/shared/atoms/Button';
import Typography from '@/components/shared/atoms/Typography';
import PFAdd from '@/components/shared/icons/action/PFAdd';
import AvatarListItem from './AvatarListItem';

const AvatarFaceList = async () => {
  // const connectWithMetamask = useMetamask();
  // const disconnect = useDisconnect();
  // const address = useAddress();
  const faceList = await AvatarService.getFaceList();

  return (
    <div className='flexCol gap-4'>
      <div className='flexRow justify-end items-center gap-3'>
        <div className='flexRow items-center gap-5'>
          <Typography type='detail1' className='flexRowCenter gap-1 text-gray-50'>
            연결된 지갑
            <Typography as='span' className='text-red-300'>
              1
            </Typography>
          </Typography>
          <Button variant='outline' color='secondary' className='px-[24px]'>
            0xC6…880D
          </Button>
        </div>
        <Button variant='fill' color='secondary' Icon={<PFAdd />} className='px-[38px]'>
          추가 연결
        </Button>
      </div>
      <div className='max-h-[416px] grid grid-cols-2 gap-3 laptop:grid-cols-3 desktop:grid-cols-5  overflow-y-auto styled-scroll'>
        {faceList.map((avatar) => (
          <AvatarListItem key={avatar.id} avatar={avatar} from='face' />
        ))}
      </div>
    </div>
  );
};

export default AvatarFaceList;
