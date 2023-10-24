'use client';
import { FC } from 'react';
import { FetchStatus } from '@/api/@types/@shared';
import { AvatarParts } from '@/api/@types/Avatar';
import AvatarListItem from '@/components/features/Avatar/AvatarListItem';
import Button from '@/components/shared/atoms/Button';
import Typography from '@/components/shared/atoms/Typography';
import PFAdd from '@/components/shared/icons/action/PFAdd';

interface Props {
  list: AvatarParts[];
  selected?: AvatarParts;
  setSelected: (body: AvatarParts) => void;
  status: FetchStatus;
}

const AvatarFaceList: FC<Props> = ({ list, selected, setSelected, status }) => {
  // const connectWithMetamask = useMetamask();
  // const disconnect = useDisconnect();
  // const address = useAddress();
  if (status === 'loading') {
    // FIXME: 로딩 디자인 나오면 수정
    return (
      <div className='flexRow justify-center items-center'>
        <Typography type='detail1'>로딩중...</Typography>
      </div>
    );
  }
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
    </div>
  );
};

export default AvatarFaceList;
