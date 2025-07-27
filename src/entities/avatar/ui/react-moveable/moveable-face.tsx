import { useState } from 'react';
import Moveable from 'react-moveable';
import { useSelectedAvatarState } from '@/features/edit-profile-avatar/lib/selected-avatar-state.context';
import { MoveableHelper } from './moveable.helper';
import { FacePos } from '../../model/avatar.model';

export const DEFAULT_FACE_POS: FacePos = {
  offsetX: 20,
  offsetY: 10,
  zoom: 80,
};

type Props = {
  faceRef: React.RefObject<HTMLElement>;
  onFacePosChange: (facePos: FacePos) => void;
  faceWidth: number;
  faceHeight: number;
};

function MoveableFace({ faceRef, onFacePosChange, faceWidth, faceHeight }: Props) {
  const selectedAvatar = useSelectedAvatarState();

  const [helper] = useState(() => {
    return new MoveableHelper(
      selectedAvatar.facePos ?? DEFAULT_FACE_POS,
      onFacePosChange,
      faceWidth,
      faceHeight
    );
  });

  return (
    <Moveable
      target={faceRef}
      draggable={true}
      scalable={true}
      keepRatio={true}
      rotatable={true}
      padding={{ top: 20, left: 20, right: 20, bottom: 20 }}
      onDrag={helper.onDrag}
      onScale={helper.onScale}
    />
  );
}

export { MoveableFace };
