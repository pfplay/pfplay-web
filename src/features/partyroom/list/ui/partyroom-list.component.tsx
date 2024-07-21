'use client';

import PartyroomCard from './partyroom-card.component';
import { useFetchGeneralPartyrooms } from '../api/use-fetch-general-partyrooms.query';

const PartyroomList = () => {
  const { data: partyRooms = [] } = useFetchGeneralPartyrooms();

  return (
    <>
      {partyRooms.map((partyRoom) => (
        <PartyroomCard
          key={partyRoom.partyroomId}
          roomId={partyRoom.partyroomId}
          summary={partyRoom}
        />
      ))}
    </>
  );
};

export default PartyroomList;
