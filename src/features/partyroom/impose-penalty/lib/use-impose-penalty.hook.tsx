import { ReactNode, useState } from 'react';
import { GradeType, PenaltyType } from '@/shared/api/http/types/@enums';
import { PartyroomCrew } from '@/shared/api/http/types/partyrooms';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { LineBreakProcessor } from '@/shared/lib/localization/renderer';
import { Trans } from '@/shared/lib/localization/renderer/index.ui';
import { useStores } from '@/shared/lib/store/stores.context';
import { Dialog, useDialog } from '@/shared/ui/components/dialog';
import { Input } from '@/shared/ui/components/input';
import { Typography } from '@/shared/ui/components/typography';
import useCanImposePenalty from '../api/use-can-impose-penalty.hook';
import useImposePenaltyMutation from '../api/use-impose-penalty.mutation';

export default function useImposePenalty() {
  const t = useI18n();
  const { openDialog } = useDialog();
  const partyroomId = useStores().useCurrentPartyroom((state) => state.id);
  const canImposePenalty = useCanImposePenalty();

  return ({
    crewId,
    crewGradeType,
    nickname,
    penaltyType,
  }: Pick<PartyroomCrew, 'crewId' | 'nickname'> & {
    penaltyType: PenaltyType;
    crewGradeType: GradeType;
  }) => {
    if (!partyroomId || !canImposePenalty(crewGradeType)) return;

    return openDialog((onOk, onClose) => ({
      title: ({ defaultTypographyType, defaultClassName }) => (
        <Typography type={defaultTypographyType} className={defaultClassName}>
          {penaltyTypeToTitleMap[penaltyType]}
        </Typography>
      ),
      Sub: (
        // eslint-disable-next-line i18next/no-literal-string
        <Typography type='detail1' className='text-gray-300 mt-3'>
          To. &apos;{nickname}&apos;
        </Typography>
      ),
      Body: () => {
        const { mutate: imposePenalty, isPending } = useImposePenaltyMutation();
        const [reason, setReason] = useState('');
        const disabled = reason.length < 2;

        const handleConfirmBtnClick = () => {
          imposePenalty(
            {
              partyroomId,
              crewId,
              penaltyType,
              detail: reason,
            },
            {
              onSettled: () => {
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
              placeholder={t.chat.para.reason_shared}
              classNames={{ container: 'mb-9' }}
            />
            <Dialog.ButtonGroup>
              <Dialog.Button color='secondary' onClick={onClose}>
                {t.common.btn.cancel}
              </Dialog.Button>
              <Dialog.Button
                loading={isPending}
                onClick={handleConfirmBtnClick}
                disabled={disabled}
              >
                {t.common.btn.confirm}
              </Dialog.Button>
            </Dialog.ButtonGroup>
          </>
        );
      },
    }));
  };
}

const penaltyTypeToTitleMap: Record<PenaltyType, ReactNode> = {
  [PenaltyType.CHAT_BAN_30_SECONDS]: <Trans i18nKey='chat.para.muted_by_admin' />,
  [PenaltyType.ONE_TIME_EXPULSION]: <Trans i18nKey='chat.para.removed_by_admin' />,
  [PenaltyType.PERMANENT_EXPULSION]: (
    <Trans i18nKey='chat.para.permanent_ban' processors={[new LineBreakProcessor()]} />
  ),
  [PenaltyType.CHAT_MESSAGE_REMOVAL]: null,
};
