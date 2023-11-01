'use server';

import { AvatarService } from '@/api/services/Avatar';

// interface Props {
// list: AvatarParts[];
// selected?: AvatarParts;
// setSelected: (body: AvatarParts) => void;
// status: FetchStatus;
// }

const AvatarBodyList = async () => {
  // if (status === 'loading') {
  //   // FIXME: 로딩 디자인 나오면 수정
  //   return (
  //     <div className='flexRow justify-center items-center'>
  //       <Typography type='detail1'>로딩중...</Typography>
  //     </div>
  //   );
  // }
  const bodyList = await AvatarService.getBodyList();

  return (
    <div className='max-h-[460px] grid grid-cols-2 gap-3 laptop:grid-cols-3 desktop:grid-cols-5 overflow-y-auto styled-scroll'>
      {bodyList.map((avatar) => (
        <div key={avatar.id}>{avatar.id}</div>
        // <AvatarListItem
        //   key={avatar.id}
        //   avatar={avatar}
        //   selected={avatar.id === selected?.id}
        //   setSelected={setSelected}
        // />
      ))}
    </div>
  );
};

export default AvatarBodyList;
