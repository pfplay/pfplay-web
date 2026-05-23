import { ReactElement } from 'react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useUpdateMyAvatar } from '../api/use-update-my-avatar.mutation';
import { useSelectedAvatarState } from '../lib/selected-avatar-state.context';
// import { useAvatarCapture } from '../lib/use-avatar-capture.hook';

type ChildrenProps = {
  done: () => Promise<void>;
  canSubmit: boolean;
  loading: boolean;
  submitHint?: string;
};

type Props = {
  children: (props: ChildrenProps) => ReactElement;
  onSuccess?: () => void;
};

export default function AvatarEditDone({ children, onSuccess }: Props) {
  const t = useI18n();
  const { body, faceUri, facePos } = useSelectedAvatarState();
  const canSubmit = !!body && (!body.combinable || !!faceUri);
  const { mutate: updateAvatar, isPending } = useUpdateMyAvatar();
  const submitHint = canSubmit ? undefined : t.settings.para.avatar_save_requirements;

  const done = async () => {
    if (!canSubmit) return;
    try {
      await updateAvatar({ body, faceUri, facePos }, { onSuccess });
    } catch (error) {
      console.error('Avatar update failed:', error);
    }
  };

  return children({
    done,
    canSubmit,
    loading: isPending,
    submitHint,
  });
}
