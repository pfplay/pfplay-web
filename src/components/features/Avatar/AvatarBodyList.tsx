import { AvatarService } from '@/api/services/Avatar';
import AvatarListItem from './AvatarListItem';

const AvatarBodyList = async () => {
  const bodyList = await AvatarService.getBodyList();

  return (
    <div className='max-h-[460px] grid grid-cols-2 gap-3 laptop:grid-cols-3 desktop:grid-cols-5 overflow-y-auto styled-scroll'>
      {bodyList.map((avatar) => (
        <AvatarListItem key={avatar.id} avatar={avatar} />
      ))}
    </div>
  );
};

export default AvatarBodyList;
