import { useRouter } from 'next/navigation';
import { useGetMyServiceEntry } from '@/entities/me';

export default function useOAuth2Callback() {
  const router = useRouter();
  const getMyServiceEntry = useGetMyServiceEntry();

  const handleCallback = async () => {
    const serviceEntry = await getMyServiceEntry();
    router.push(serviceEntry);
  };

  return { handleCallback };
}
