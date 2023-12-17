'use client';

import { usePartyRoomsSuspenseQuery } from '@/api/react-query/Parties/usePartyRoomsSuspenseQuery';
import InfiniteScroll from '@/components/shared/InfiniteScroll';
import PartyRoomCard from './PartyRoomCard';

const PartyRoomList = () => {
  const {
    data: partyRooms,
    fetchNextPage,
    hasNextPage,
  } = usePartyRoomsSuspenseQuery({
    page: 0,
    size: 10,
  });

  return (
    <InfiniteScroll load={fetchNextPage} hasMore={hasNextPage}>
      {partyRooms.map((partyRoom) => (
        <PartyRoomCard key={partyRoom.roomId} roomId={partyRoom.roomId} summary={partyRoom} />
      ))}
    </InfiniteScroll>
  );
};

export default PartyRoomList;
