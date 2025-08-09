import { useRouter } from 'next/navigation';
import { useGetMyServiceEntry } from '@/entities/me';
import { type OAuth2Provider } from '@/shared/api/http/types/oauth';
import useExchangeToken from '../api/use-exchange-token';

export default function useOAuth2Callback(provider: OAuth2Provider) {
  const router = useRouter();
  const getMyServiceEntry = useGetMyServiceEntry();
  const { mutate: exchangeToken } = useExchangeToken();

  const handleCallback = async () => {
    await exchangeToken({ oauth2Provider: provider });
    const serviceEntry = await getMyServiceEntry();
    router.push(serviceEntry);
  };

  return { handleCallback };
}
