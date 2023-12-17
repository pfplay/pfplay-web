'use client';
import { PartiesService } from '@/api/services/Parties';
import InfiniteScroll from '@/components/shared/InfiniteScroll';
import { usePagination } from '@/hooks/usePagination';
import PartyRoomCard from './PartyRoomCard';

const PartyRoomList = () => {
  const { data, nextPage, pageable } = usePagination(PartiesService.getList);

  return (
    <InfiniteScroll load={nextPage} hasMore={!pageable.isLastPage} endMessage={null}>
      {data?.map((partyRoom) => (
        <PartyRoomCard key={partyRoom.roomId} roomId={partyRoom.roomId} summary={partyRoom} />
      ))}
    </InfiniteScroll>
  );
};

export default PartyRoomList;
