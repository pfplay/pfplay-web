'use client';
import AvatarListItem from './avatar-list-item.component';
import ConnectWalletButton from './connect-wallet-button.component';
import { useFetchAvatarFaces } from '../api/use-fetch-avatar-faces.query';

const AvatarFaceList = () => {
  const { data: faces = [] } = useFetchAvatarFaces();

  return (
    <div className='flexCol gap-4'>
      <div className='flexRow justify-end items-center gap-3'>
        <ConnectWalletButton />
      </div>
      <div className='max-h-[416px] grid grid-cols-2 gap-3 laptop:grid-cols-3 desktop:grid-cols-5  overflow-y-auto'>
        {/* TODO: Add wallet faces */}

        {faces.map((face) => (
          <AvatarListItem key={face.resourceUri} meta={face} from='face' />
        ))}
      </div>
    </div>
  );
};

export default AvatarFaceList;
