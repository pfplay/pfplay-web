'use client';

import { InfiniteScroll } from '@/shared/ui/components/infinite-scroll';
import PartyroomCard from './partyroom-card.component';
import { useFetchPartyrooms } from '../api/use-fetch-partyrooms.query';

const PartyroomList = () => {
  const {
    data: partyRooms,
    fetchNextPage,
    hasNextPage,
  } = useFetchPartyrooms({
    pageNumber: 0,
    pageSize: 10,
  });

  return (
    <InfiniteScroll loadMore={fetchNextPage} hasMore={hasNextPage}>
      {partyRooms?.map((partyRoom) => (
        <PartyroomCard key={partyRoom.roomId} roomId={partyRoom.roomId} summary={partyRoom} />
      ))}
    </InfiniteScroll>
  );
};

export default PartyroomList;
