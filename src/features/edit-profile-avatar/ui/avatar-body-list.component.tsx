'use client';
import { useFetchAvatarBodies } from 'features/edit-profile-avatar/api/use-fetch-avatar-bodies.query';
import AvatarListItem from './avatar-list-item.component';

const AvatarBodyList = () => {
  const { data: bodies = [] } = useFetchAvatarBodies();

  return (
    <div className='max-h-[460px] grid grid-cols-2 gap-3 laptop:grid-cols-3 desktop:grid-cols-5 overflow-y-auto'>
      {bodies.map((body) => (
        <AvatarListItem key={body.id} meta={body} from='body' />
      ))}
    </div>
  );
};

export default AvatarBodyList;
