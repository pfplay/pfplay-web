import { FC } from 'react';
import { FetchStatus } from '@/api/@types/@shared';
import { AvatarParts } from '@/api/@types/Avatar';
import AvatarListItem from '@/components/features/Avatar/AvatarListItem';
import Typography from '@/components/shared/atoms/Typography';

interface Props {
  list: AvatarParts[];
  selected?: AvatarParts;
  setSelected: (body: AvatarParts) => void;
  status: FetchStatus;
}

const AvatarBodyList: FC<Props> = ({ list, selected, setSelected, status }) => {
  if (status === 'loading') {
    // FIXME: 로딩 디자인 나오면 수정
    return (
      <div className='flexRow justify-center items-center'>
        <Typography type='detail1'>로딩중...</Typography>
      </div>
    );
  }

  return (
    <div className='max-h-[460px] grid grid-cols-2 gap-3 laptop:grid-cols-3 desktop:grid-cols-5 overflow-y-auto styled-scroll'>
      {status === 'succeeded' &&
        list.map((avatar) => (
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
