import { ReactNode, useEffect } from 'react';
import { PenaltyType } from '@/shared/api/http/types/@enums';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { replaceVar } from '@/shared/lib/localization/split-render';
import { useStores } from '@/shared/lib/store/stores.context';
import { Dialog, useDialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';
import type { AlertMessage } from '../model/alert.model';

export default function usePenaltyAlert() {
  const t = useI18n();
  const alert = useStores().useCurrentPartyroom((state) => state.alert);
  const { openDialog } = useDialog();

  const openPenaltyAlertDialog = (penaltyType: PenaltyType, reason: ReactNode) => {
    openDialog((_, onCancel) => ({
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
  };

  useEffect(() => {
    const callback = (message: AlertMessage) => {
      if (Object.values(PenaltyType).includes(message.type)) {
        openPenaltyAlertDialog(message.type, message.reason);
      }
    };

    alert.subscribe(callback);

    return () => {
      alert.unsubscribe(callback);
    };
  }, []);
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
