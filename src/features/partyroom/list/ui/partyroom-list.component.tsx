'use client';

import PartyroomCard from './partyroom-card.component';
import { useFetchGeneralPartyrooms } from '../api/use-fetch-general-partyrooms.query';

interface PartyroomListProps {
  onClose?: () => void;
}

const PartyroomList = ({ onClose }: PartyroomListProps) => {
  const { data: partyRooms = [] } = useFetchGeneralPartyrooms();

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
