import { FC } from 'react';
import { AvatarParts } from '@/api/@types/Avatar';
import AvatarListItem from '@/components/features/Avatar/AvatarListItem';

interface Props {
  list: AvatarParts[];
  selected?: AvatarParts;
  setSelected: (body: AvatarParts) => void;
}

const AvatarBodyList: FC<Props> = ({ list, selected, setSelected }) => {
  return (
    <div className='max-h-[300px] grid grid-cols-2 gap-3 laptop:grid-cols-3 desktop:grid-cols-5 mt-7 mb-10 overflow-y-auto styled-scroll'>
      {list.map((avatar) => (
        <AvatarListItem
          key={avatar.id}
          avatar={avatar}
          selected={avatar.id === selected?.id}
          setSelected={setSelected}
        />
      ))}
    </div>
  );
};

export default AvatarBodyList;
