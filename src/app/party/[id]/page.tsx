'use client';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import PartyroomsService from '@/shared/api/http/services/partyrooms';

export default function SharedLinkPage() {
  const { id } = useParams();

  const enterBySharedLink = async () => {
    try {
      const response = await PartyroomsService.enterBySharedLink({ linkDomain: String(id) });
      console.log(response);
    } catch (error) {
      console.error({ error });
    }
  };

  useEffect(() => {
    if (id) {
      enterBySharedLink();
    }
  }, []);

  return null;
}
