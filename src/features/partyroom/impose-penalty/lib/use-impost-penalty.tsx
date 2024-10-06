import { useState } from 'react';
import { PenaltyType } from '@/shared/api/http/types/@enums';
import { PartyroomCrew } from '@/shared/api/http/types/partyrooms';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { replaceVar } from '@/shared/lib/localization/split-render';
import { useStores } from '@/shared/lib/store/stores.context';
import { Dialog, useDialog } from '@/shared/ui/components/dialog';
import { Input } from '@/shared/ui/components/input';
import { Typography } from '@/shared/ui/components/typography';
import useImposePenaltyMutation from '../api/use-impose-penalty.mutation';

export default function useImposePenalty() {
  const t = useI18n();
  const { openDialog } = useDialog();
  const partyroomId = useStores().useCurrentPartyroom((state) => state.id);

  return ({
    crewId,
    nickname,
    penaltyType,
  }: Pick<PartyroomCrew, 'crewId' | 'nickname'> & { penaltyType: PenaltyType }) => {
    if (!partyroomId) return;

    return openDialog((onOk, onClose) => ({
      title: ({ defaultTypographyType, defaultClassName }) => (
        <Typography type={defaultTypographyType} className={defaultClassName}>
          {getPenaltyTypeTitle(penaltyType)}
        </Typography>
      ),
      Sub: (
        // eslint-disable-next-line i18next/no-literal-string
        <Typography type='detail1' className='text-gray-300 mt-3'>
          To. &apos;{nickname}&apos;
        </Typography>
      ),
      Body: () => {
        const [isLoading, setIsLoading] = useState(false);
        const { mutate: imposePenalty } = useImposePenaltyMutation();
        const [reason, setReason] = useState('');
        const disabled = reason.length < 2;

        const handleConfirmBtnClick = () => {
          setIsLoading(true);
          imposePenalty(
            {
              partyroomId,
              crewId,
              penaltyType,
              reason,
            },
            {
              onSettled: () => {
                setIsLoading(false);
                onOk();
              },
            }
          );
        };

        return (
          <>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              minLength={2}
              placeholder={'작성된 사유는 사용자에게 전달됩니다(최소 2자)'} // TODO: i18n 적용
              classNames={{ container: 'mb-9' }}
            />
            <Dialog.ButtonGroup>
              <Dialog.Button color='secondary' onClick={onClose}>
                {t.common.btn.cancel}
              </Dialog.Button>
              <Dialog.Button
                loading={isLoading}
                onClick={handleConfirmBtnClick}
                disabled={disabled}
              >
                {!isLoading ? t.common.btn.confirm : ''}
              </Dialog.Button>
            </Dialog.ButtonGroup>
          </>
        );
      },
    }));
  };
}

// TODO: i18n 적용
function getPenaltyTypeTitle(penaltyType: PenaltyType) {
  return penaltyType === PenaltyType.CHAT_BAN_30_SECONDS
    ? replaceVar('$1합니다', {
        $1: <b className='text-red-300'>30초간 채팅을 금지</b>,
      })
    : penaltyType === PenaltyType.ONE_TIME_EXPULSION
    ? replaceVar('즉시 퇴출되며 $1합니다', {
        $1: <b className='text-red-300'>재입장이 가능</b>,
      })
    : replaceVar('즉시 퇴출되며 $1합니다', {
        $1: <b className='text-red-300'>재입장이 불가능</b>,
      });
}
