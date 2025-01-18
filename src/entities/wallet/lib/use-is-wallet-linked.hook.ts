import { useFetchMeAsync } from '@/entities/me';
import { AuthorityTier } from '@/shared/api/http/types/@enums';

export default function useIsWalletLinked() {
  const fetchMeAsync = useFetchMeAsync();

  return async function isWalletLinked() {
    const me = await fetchMeAsync();

    return me.authorityTier === AuthorityTier.FM && !!me.walletAddress;
  };
}
