import { useRouter } from 'next/navigation';
import { ReactElement } from 'react';
import { useUpdateMyAvatar } from '../api/use-update-my-avatar.mutation';
import { useSelectedAvatarState } from '../lib/selected-avatar-state.context';

type ChildrenProps = {
  done: () => Promise<void>;
  canSubmit: boolean;
  loading: boolean;
};

type Props = {
  children: (props: ChildrenProps) => ReactElement;
};

export default function EditDone({ children }: Props) {
  const router = useRouter();
  const { body, faceUri } = useSelectedAvatarState();
  const canSubmit = !!body && (!body.combinable || !!faceUri);
  const { mutate: updateAvatar, isPending } = useUpdateMyAvatar();

  const done = async () => {
    if (!canSubmit) return;

    updateAvatar(
      { body, faceUri },
      {
        onSuccess: () => {
          router.push('/parties');
        },
      }
    );
  };

  return children({
    done,
    canSubmit,
    loading: isPending,
  });
}
