import { ReactNode, useCallback } from 'react';
import { PenaltyType } from '@/shared/api/http/types/@enums';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { LineBreakProcessor } from '@/shared/lib/localization/renderer';
import { Trans } from '@/shared/lib/localization/renderer/index.ui';
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

  const afterConfirm = (penaltyType: PenaltyType) => {
    switch (penaltyType) {
      case PenaltyType.ONE_TIME_EXPULSION:
      case PenaltyType.PERMANENT_EXPULSION:
        // 강제 퇴장은 서버 측에서 처리되므로 클라이언트는 백엔드 exit을 호출하지 않고
        // 로비로만 이동한다. 클라이언트 정리는 레이아웃 언마운트(teardown)가 수행한다.
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
              <Dialog.Button data-testid='penalty-alert-confirm-button' onClick={onCancel}>
                {t.common.btn.confirm}
              </Dialog.Button>
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
