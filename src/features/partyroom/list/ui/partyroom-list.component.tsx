'use client';

import { useEffect, useRef } from 'react';

import { track } from '@/shared/lib/analytics';

import PartyroomCard from './partyroom-card.component';
import { useFetchGeneralPartyrooms } from '../api/use-fetch-general-partyrooms.query';

interface PartyroomListProps {
  onClose?: () => void;
  /**
   * `Partyroom List Viewed` analytics event를 발화할지 여부.
   * 로비 페이지(`/parties`) 진입에서만 true. 인룸 panel 등에서 재사용 시 false 유지.
   */
  trackView?: boolean;
}

const PartyroomList = ({ onClose, trackView = false }: PartyroomListProps) => {
  const { data: partyRooms = [], isSuccess } = useFetchGeneralPartyrooms();
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!trackView || !isSuccess || trackedRef.current) return;
    trackedRef.current = true;
    track('Partyroom List Viewed', { partyroom_count: partyRooms.length });
  }, [trackView, isSuccess, partyRooms.length]);

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
