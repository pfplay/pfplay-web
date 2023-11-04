import { Authority, PartyRoomStatus, PartyRoomType } from './@enums';

export interface PartyRoom {
  name: string;
  introduce: string;
  domain: string;
  domainOption: boolean;
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

export interface PartyRoomClient {
  createPartyRoom(): Promise<CreatePartyRoomResponse>;
}
