'use client';

import { InfiniteScroll } from '@/shared/ui/components/infinite-scroll';
import { useSuspenseFetchPartyrooms } from 'features/list-partyrooms/api/use-suspense-fetch-partyrooms.query';
import PartyroomCard from 'features/list-partyrooms/ui/partyroom-card.component';

const PartyroomList = () => {
  const {
    data: partyRooms,
    fetchNextPage,
    hasNextPage,
  } = useSuspenseFetchPartyrooms({
    page: 0,
    size: 10,
  });

  return (
    <InfiniteScroll load={fetchNextPage} hasMore={hasNextPage}>
      {partyRooms.map((partyRoom) => (
        <PartyroomCard key={partyRoom.roomId} roomId={partyRoom.roomId} summary={partyRoom} />
      ))}
    </InfiniteScroll>
  );
};

export default PartyroomList;
