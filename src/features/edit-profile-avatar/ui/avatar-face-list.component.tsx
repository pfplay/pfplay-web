'use client';
import AvatarFaceListItem from './avatar-face-list-item.component';
import ConnectWalletButton from './connect-wallet-button.component';
import { useFetchAvatarFaces } from '../api/use-fetch-avatar-faces.query';

const AvatarFaceList = () => {
  const { data: faces = [] } = useFetchAvatarFaces();

  return (
    <div className='flexCol gap-4 overflow-hidden'>
      <div className='flexRow justify-end items-center gap-3'>
        <ConnectWalletButton />
      </div>
      <div className='flex-1 grid grid-cols-2 gap-3 laptop:grid-cols-3 desktop:grid-cols-5 overflow-y-auto'>
        {/* TODO: Add wallet faces */}

        {faces.map((face) => (
          <AvatarFaceListItem key={face.resourceUri} meta={face} />
        ))}
      </div>
    </div>
  );
};

export default AvatarFaceList;
