import { PenaltyType } from '@/shared/api/http/types/@enums';
import { ImposePenaltyPayload } from '@/shared/api/http/types/partyrooms';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { Dialog, useDialog } from '@/shared/ui/components/dialog';
import useImposePenaltyMutation from '../api/use-impose-penalty.mutation';

export default function useDeleteChatMessage() {
  const t = useI18n();
  const { openDialog } = useDialog();
  const partyroomId = useStores().useCurrentPartyroom((state) => state.id);

  return ({ crewId, detail }: Pick<ImposePenaltyPayload, 'crewId' | 'detail'>) => {
    if (!partyroomId) return;

    return openDialog((onOk, onClose) => ({
      title: '해당 메세지를 정말로 삭제하시겠어요? 삭제되면 복구할 수 없어요', // TODO: i18n 적용
      Body: () => {
        const { mutate: deleteChatMessage, isPending } = useImposePenaltyMutation();

        const handleConfirmBtnClick = () => {
          deleteChatMessage(
            {
              partyroomId,
              crewId,
              penaltyType: PenaltyType.CHAT_MESSAGE_REMOVAL,
              detail,
            },
            {
              onSettled: () => {
                onOk();
              },
            }
          );
        };

        return (
          <Dialog.ButtonGroup>
            <Dialog.Button color='secondary' onClick={onClose}>
              {t.common.btn.cancel}
            </Dialog.Button>
            <Dialog.Button loading={isPending} onClick={handleConfirmBtnClick}>
              {t.common.btn.confirm}
            </Dialog.Button>
          </Dialog.ButtonGroup>
        );
      },
    }));
  };
}
