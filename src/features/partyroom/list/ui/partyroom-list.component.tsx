'use client';

import { useEffect, useRef } from 'react';

import { track } from '@/shared/lib/analytics';

import PartyroomCard from './partyroom-card.component';
import { useFetchGeneralPartyrooms } from '../api/use-fetch-general-partyrooms.query';

interface PartyroomListProps {
  onClose?: () => void;
}

const PartyroomList = ({ onClose }: PartyroomListProps) => {
  const { data: partyRooms = [], isSuccess } = useFetchGeneralPartyrooms();
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!isSuccess || trackedRef.current) return;
    trackedRef.current = true;
    track('Partyroom List Viewed', { partyroom_count: partyRooms.length });
  }, [isSuccess, partyRooms.length]);

  return (
    <>
      {partyRooms.map((partyRoom) => (
        <PartyroomCard
          key={partyRoom.partyroomId}
          roomId={partyRoom.partyroomId}
          summary={partyRoom}
          onClose={onClose}
        />
      ))}
    </>
  );
};

export default PartyroomList;
