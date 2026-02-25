import { ReactNode, useCallback } from 'react';
import { PenaltyType } from '@/shared/api/http/types/@enums';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { LineBreakProcessor } from '@/shared/lib/localization/renderer';
import { Trans } from '@/shared/lib/localization/renderer/index.ui';
import { useStores } from '@/shared/lib/store/stores.context';
import { Dialog, useDialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';
import useAlert from './use-alert.hook';
import * as AlertMessage from '../../model/alert-message.model';

export default function usePenaltyAlert() {
  const openPenaltyAlertDialog = useOpenPenaltyAlertDialog();

  useAlert(
    useCallback(
      (message) => {
        if (AlertMessage.isPenaltyAlertMessage(message)) {
          openPenaltyAlertDialog(message.type, message.reason);
        }
      },
      [openPenaltyAlertDialog]
    )
  );
}

function useOpenPenaltyAlertDialog() {
  const t = useI18n();
  const { openDialog } = useDialog();
  const markExitedOnBackend = useStores().useCurrentPartyroom((state) => state.markExitedOnBackend);

  const afterConfirm = (penaltyType: PenaltyType) => {
    switch (penaltyType) {
      case PenaltyType.ONE_TIME_EXPULSION:
      case PenaltyType.PERMANENT_EXPULSION:
        markExitedOnBackend();
        location.href = '/parties';
    }
  };

  return useCallback(
    async (penaltyType: PenaltyType, reason: ReactNode) => {
      await openDialog((_, onCancel) => ({
        title: ({ defaultTypographyType, defaultClassName }) => (
          <Typography type={defaultTypographyType} className={defaultClassName}>
            {penaltyTypeToTitleMap[penaltyType]}
          </Typography>
        ),
        Body: (
          <>
            <Typography type='body3' className='text-gray-50'>
              {t.common.para.reason}: {reason}
            </Typography>

            <Dialog.ButtonGroup>
              <Dialog.Button onClick={onCancel}>{t.common.btn.confirm}</Dialog.Button>
            </Dialog.ButtonGroup>
          </>
        ),
      }));

      afterConfirm(penaltyType);
    },
    [t]
  );
}

const penaltyTypeToTitleMap: Record<PenaltyType, ReactNode> = {
  [PenaltyType.CHAT_BAN_30_SECONDS]: <Trans i18nKey='chat.para.muted_by_admin' />,
  [PenaltyType.ONE_TIME_EXPULSION]: <Trans i18nKey='chat.para.removed_by_admin' />,
  [PenaltyType.PERMANENT_EXPULSION]: (
    <Trans i18nKey='chat.para.permanent_ban' processors={[new LineBreakProcessor()]} />
  ),
  [PenaltyType.CHAT_MESSAGE_REMOVAL]: null,
};
