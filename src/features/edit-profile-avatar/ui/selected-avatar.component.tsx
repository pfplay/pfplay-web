import { Avatar } from '@/entities/avatar';
import { useSelectedAvatarState } from '../lib/selected-avatar-state.context';

const SelectedAvatar = () => {
  const selectedAvatar = useSelectedAvatarState();

  return (
    <div className='w-[360px] h-full min-h-[500px] flexCol justify-center items-center bg-black select-none'>
      {selectedAvatar.body && (
        <Avatar
          height={400}
          bodyUri={selectedAvatar.body.resourceUri}
          /**
           * NOTE
           *  combinable이 false라고 해서 선택했던 faceUri를 초기화하진 않고, 단순히 뷰에서만 감춥니다.
           *  이는 combinable이 다시 true로 변경될 때, 선택했던 faceUri를 다시 적용해주기 위함입니다.
           *  combinable 상태에 따른 faceUri 변경 여부는 마지막 api 호출 시점에 컨트롤합니다.
           */
          faceUri={selectedAvatar.body.combinable ? selectedAvatar.faceUri : undefined}
          facePosX={selectedAvatar.body.combinePositionX}
          facePosY={selectedAvatar.body.combinePositionY}
        />
      )}
    </div>
  );
};

export default SelectedAvatar;
