import { useRemoveCurrentPartyroomCaches } from '@/entities/current-partyroom';
import { PartyroomClosedEvent } from '@/shared/api/websocket/types/partyroom';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useAppRouter } from '@/shared/lib/router/use-app-router.hook';
import { useStores } from '@/shared/lib/store/stores.context';
import { useDialog } from '@/shared/ui/components/dialog';

export default function usePartyroomCloseCallback() {
  const { useCurrentPartyroom } = useStores();
  const reset = useCurrentPartyroom((state) => state.reset);
  const removeCurrentPartyroomCaches = useRemoveCurrentPartyroomCaches();
  const router = useAppRouter();
  const { openAlertDialog } = useDialog();
  const t = useI18n();

  return (_event: PartyroomClosedEvent) => {
    router.replace('/parties');
    reset();
    removeCurrentPartyroomCaches();
    openAlertDialog({
      // NOTE: 얼럿 띄울지 말지 논의 필요 - https://pfplay.slack.com/archives/C03QTFBU8QG/p1737204113200289
      content: t.party.para.closed,
    });
  };
}
