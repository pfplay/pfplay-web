import { GradeType } from '@/shared/api/http/types/@enums';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useCanEditCurrentPartyroom() {
  const myPartyroomInfo = useStores().useCurrentPartyroom((state) => state.me);

  return myPartyroomInfo?.gradeType === GradeType.HOST;
}
