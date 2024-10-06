import { PenaltyType } from '@/shared/api/http/types/@enums';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { replaceVar } from '@/shared/lib/localization/split-render';
import { useStores } from '@/shared/lib/store/stores.context';
import { Dialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';

export default function PenaltyNotificationDialog() {
  const t = useI18n();
  const [penaltyNotification, setPenaltyNotification, me] = useStores().useCurrentPartyroom(
    (state) => [state.penaltyNotification, state.setPenaltyNotification, state.me]
  );
  const isPunished = penaltyNotification && me?.crewId === penaltyNotification.punishedId;

  if (!isPunished) {
    return null;
  }

  const handleClose = () => {
    setPenaltyNotification(undefined);
  };

  return (
    <Dialog
      open={!!isPunished}
      onClose={handleClose}
      title={({ defaultTypographyType, defaultClassName }) => (
        <Typography type={defaultTypographyType} className={defaultClassName}>
          {getPenaltyTypeTitle(penaltyNotification.penaltyType)}
        </Typography>
      )}
      Sub={
        <Typography type='body3' className='text-gray-50'>
          Reason: {penaltyNotification.detail}
        </Typography>
      }
      Body={
        <Dialog.ButtonGroup>
          <Dialog.Button onClick={handleClose}>{t.common.btn.confirm}</Dialog.Button>
        </Dialog.ButtonGroup>
      }
    />
  );
}

// TODO: i18n 적용
const getPenaltyTypeTitle = (penaltyType: PenaltyType) => {
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
};
