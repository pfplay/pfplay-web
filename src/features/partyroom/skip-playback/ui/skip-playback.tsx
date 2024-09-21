import { ReactNode } from 'react';
import { Permission } from '@/entities/current-partyroom/model/crew.model';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { useDialog } from '@/shared/ui/components/dialog';
import { useSkipPlayback } from '../api/use-skip-playback.mutation';

interface Props {
  children: (skipPlayback: () => Promise<void>) => ReactNode;
}
export const SkipPlayback = ({ children }: Props) => {
  const t = useI18n();
  const { openConfirmDialog } = useDialog();
  const { mutate: skipPlaybackMutation } = useSkipPlayback();
  const [id, me] = useStores().useCurrentPartyroom((state) => [state.id, state.me]);

  if (!me || !Permission.of(me.gradeType).canSkipPlayback()) {
    return null;
  }

  const skipPlayback = async () => {
    const confirmed = await openConfirmDialog({
      title: 'Do you want to skip the current track?', // TODO: dictionary에 추가 후 I18n으로 변경
      cancelText: t.common.btn.cancel,
      okText: t.common.btn.confirm,
    });

    if (confirmed && id) {
      skipPlaybackMutation({ partyroomId: id });
    }
  };

  return children(skipPlayback);
};
