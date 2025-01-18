import { Crew } from '@/entities/current-partyroom';
import { GradeType } from '@/shared/api/http/types/@enums';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useCanImposePenalty() {
  const me = useStores().useCurrentPartyroom((state) => state.me);
  const myPermission = me && Crew.Permission.of(me.gradeType);

  return (targetGradeType: GradeType) => {
    return !!myPermission?.canImposePenalty(targetGradeType);
  };
}
