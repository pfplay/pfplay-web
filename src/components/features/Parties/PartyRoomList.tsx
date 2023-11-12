import { PartiesService } from '@/api/services/Parties';
import PartyRoomCard from './PartyRoomCard';

const PartyRoomList = async () => {
  const partyRoomList = await PartiesService.getPartyRoomList();

  return (
    <>
      {partyRoomList.map((config) => (
        <PartyRoomCard key={config.id} roomId={config.id} playListItemConfig={config} />
      ))}
    </>
  );
};

export default PartyRoomList;
