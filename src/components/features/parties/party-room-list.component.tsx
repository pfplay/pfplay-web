'use client';

import { useSuspenseFetchPartyRooms } from '@/api/react-query/parties/use-suspense-fetch-party-rooms.query';
import InfiniteScroll from '@/shared/ui/components/infinite-scroll/infinite-scroll.component';
import PartyRoomCard from './party-room-card.component';

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
