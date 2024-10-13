import { ReactNode, useCallback } from 'react';
import { PenaltyType } from '@/shared/api/http/types/@enums';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { replaceVar } from '@/shared/lib/localization/split-render';
import { Dialog, useDialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';
import useAlert from './use-alert.hook';
import { isPenaltyAlertMessage } from '../../model/alert.model';

export default function usePenaltyAlert() {
  const openPenaltyAlertDialog = useOpenPenaltyAlertDialog();

  useAlert(
    useCallback(
      (message) => {
        if (isPenaltyAlertMessage(message)) {
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
      case PenaltyType.CHAT_MESSAGE_REMOVAL:
      case PenaltyType.ONE_TIME_EXPULSION:
        // TODO: 강제 퇴출 시 백단에서 exit 처리가 되기에, 파티룸 페이지에 걸린 unload 이벤트 리스너에 의해 떠날 때 exit이 호출되고 이 때 404 에러 얼럿이 뜰거임. 예외 처리 필요
        // @see https://pfplay.slack.com/archives/C03Q28EAU66/p1728818068967889?thread_ts=1728817067.685869&cid=C03Q28EAU66
        location.href = '/parties';
    }
  };

  return useCallback(
    async (penaltyType: PenaltyType, reason: ReactNode) => {
      await openDialog((_, onCancel) => ({
        title: ({ defaultTypographyType, defaultClassName }) => (
          <Typography type={defaultTypographyType} className={defaultClassName}>
            {getPenaltyTypeTitle(penaltyType)}
          </Typography>
        ),
        Body: (
          <>
            <Typography type='body3' className='text-gray-50'>
              {/* TODO: i18n 적용 */}Reason: {reason}
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

// TODO: i18n 적용
function getPenaltyTypeTitle(penaltyType: PenaltyType) {
  switch (penaltyType) {
    case PenaltyType.CHAT_BAN_30_SECONDS:
      return replaceVar('관리자에 의해 $1됩니다', {
        $1: <b className='text-red-300'>30초간 채팅이 금지</b>,
      });

    case PenaltyType.PERMANENT_EXPULSION:
      return replaceVar('관리자에 의해 $1되셨으며 $2합니다', {
        $1: <b className='text-red-300'>영구 퇴출</b>,
        $2: (
          <>
            <br />
            <b className='text-red-300'>재입장은 불가능</b>
          </>
        ),
      });
    case PenaltyType.ONE_TIME_EXPULSION:
      return replaceVar('관리자에 의해 $1되셨습니다', {
        $1: <b className='text-red-300'>퇴출</b>,
      });
    default:
      return '';
  }
}
