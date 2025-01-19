import { useFetchMeAsync } from '@/entities/me';
import { AuthorityTier } from '@/shared/api/http/types/@enums';

export default function useIsGuest() {
  const fetchMeAsync = useFetchMeAsync();

  return async () => {
    const me = await fetchMeAsync();

    return me.authorityTier === AuthorityTier.GT;
  };
}
