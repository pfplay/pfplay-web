import { BlockCrewPayload } from '@/shared/api/http/types/crews';
import { useStores } from '@/shared/lib/store/stores.context';
import { useDialog } from '@/shared/ui/components/dialog';
import useBlockCrewMutation from '../api/use-block-crew.mutation';

export default function useBlockCrew() {
  const crews = useStores().useCurrentPartyroom((state) => state.crews);
  const { mutate } = useBlockCrewMutation();
  const { openAlertDialog } = useDialog();

  return (payload: BlockCrewPayload) => {
    const crew = crews.find((c) => c.crewId === payload.crewId);

    mutate(payload, {
      onSuccess: () => {
        openAlertDialog({
          content: `${crew?.nickname ?? 'Crew'} has been blocked.`, // TODO: 기획에 없는 임시 얼럿. 나중에 토스트로 교체하면 좋을 듯
        });
      },
    });
  };
}
