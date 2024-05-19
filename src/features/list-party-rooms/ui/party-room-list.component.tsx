'use client';

import { InfiniteScroll } from '@/shared/ui/components/infinite-scroll';
import PartyRoomCard from './party-room-card.component';
import { useSuspenseFetchPartyRooms } from '../api/use-suspense-fetch-party-rooms.query';

const PartyRoomList = () => {
  const {
    data: partyRooms,
    fetchNextPage,
    hasNextPage,
  } = useSuspenseFetchPartyRooms({
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
