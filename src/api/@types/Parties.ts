import { PlayListItemType } from '@/components/shared/atoms/PlayListItem';
import { Authority, PartyRoomStatus, PartyRoomType } from './@enums';

export interface PartyRoom {
  name: string;
  introduce: string; // FIXME: BE가 attribute name 수정 하면 수정 필요
  domain: string | null;
  limit: number;
}

export type DefaultPartyPermission = {
  authority: Authority;
  partyInfoFetch: boolean;
  partyClose: boolean;
  notice: boolean;
  giveToClubber: boolean;
  chatDelete: boolean;
  chatLimitBanToClubber: boolean;
  kickToClubber: boolean;
  banToClubber: boolean;
  chatBan: boolean;
  djWaitLock: boolean;
  newDj: boolean;
  musicSkip: boolean;
  videoLengthLimit: boolean;
};

export interface CreatePartyRoomResponse {
  id: number;
  name: string;
  introduce: string;
  domain: string;
  djingLimit: number;
  type: PartyRoomType;
  status: PartyRoomStatus;
  admin: {
    profile: string;
    userName: string;
  };
  defaultPartyPermission: DefaultPartyPermission;
}

export interface PartiesClient {
  createPartyRoom(partyRoomConfig: PartyRoom): Promise<CreatePartyRoomResponse>;
  getPartyRoomList(): Promise<PlayListItemType[]>; // TODO: API 준비되면 return type 수정
}
