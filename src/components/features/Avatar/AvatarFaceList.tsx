import { AvatarService } from '@/api/services/Avatar';
import AvatarListItem from './AvatarListItem';
import ConnectWalletButton from './ConnectWalletButton';

const AvatarFaceList = async () => {
  const faceList = await AvatarService.getFaceList();

  return (
    <div className='flexCol gap-4'>
      <div className='flexRow justify-end items-center gap-3'>
        <ConnectWalletButton />
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
