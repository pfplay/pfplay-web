import { ReactElement } from 'react';
import { useUpdateMyAvatar } from '../api/use-update-my-avatar.mutation';
import { useSelectedAvatarState } from '../lib/selected-avatar-state.context';
// import { useAvatarCapture } from '../lib/use-avatar-capture.hook';

type ChildrenProps = {
  done: () => Promise<void>;
  canSubmit: boolean;
  loading: boolean;
};

type Props = {
  children: (props: ChildrenProps) => ReactElement;
  onSuccess?: () => void;
};

export default function AvatarEditDone({ children, onSuccess }: Props) {
  const { body, faceUri } = useSelectedAvatarState();
  // const { captureAvatar } = useAvatarCapture();
  const canSubmit = !!body && (!body.combinable || !!faceUri);
  const { mutate: updateAvatar, isPending } = useUpdateMyAvatar();

  const done = async () => {
    if (!canSubmit) return;

    try {
      // const { formData } = await captureAvatar();
      await updateAvatar({ body, faceUri }, { onSuccess });
    } catch (error) {
      console.error('Avatar capture failed:', error); // TODO: 에러 처리
    }
  };

  return children({
    done,
    canSubmit,
    loading: isPending,
  });
}
