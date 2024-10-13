'use client';
import AvatarBodyListItem from './avatar-body-list-item.component';
import { useFetchAvatarBodies } from '../api/use-fetch-avatar-bodies.query';

const AvatarBodyList = () => {
  const { data: bodies = [] } = useFetchAvatarBodies();

  return (
    <div className='flex-1 grid grid-cols-2 gap-3 laptop:grid-cols-3 desktop:grid-cols-5 grid-rows-max auto-rows-max overflow-auto'>
      {bodies.map((body) => (
        <AvatarBodyListItem key={body.id} meta={body} />
      ))}
    </div>
  );
};

export default AvatarBodyList;
