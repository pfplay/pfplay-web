'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useGetMyServiceEntry } from '@/entities/me';

export default function OAuthRedirectPage() {
  const router = useRouter();
  const getMyServiceEntry = useGetMyServiceEntry();

  useEffect(() => {
    (async () => {
      const serviceEntry = await getMyServiceEntry();

      router.push(serviceEntry);
    })();
  }, [getMyServiceEntry, router]);

  return null;
}
