import { useCallback } from 'react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { processI18nString } from '@/shared/lib/localization/renderer/processors/variable-processor-util';
import { useDialog } from '@/shared/ui/components/dialog';
import useAlert from './use-alert.hook';
import * as AlertMessage from '../../model/alert-message.model';

export default function useDjRemovedAlert() {
  const t = useI18n();
  const { openAlertDialog } = useDialog();

  useAlert(
    useCallback(
      (message) => {
        if (!AlertMessage.isDjRemovedAlertMessage(message)) return;

        let content: string;
        if (message.type === 'dj-deactivated') {
          const m = message.playbackTimeLimitMinutes;
          content =
            typeof m === 'number' && m > 0
              ? processI18nString(t.dj.para.playback_stopped_time_limit, { minutes: String(m) })
              : t.dj.para.playback_stopped_no_limit;
        } else {
          // 'dj-admin-removed'
          content = t.dj.para.deleted_queue_by_admin;
        }

        openAlertDialog({
          title: t.dj.title.dj_queue,
          content,
        });
      },
      [t, openAlertDialog]
    )
  );
}
