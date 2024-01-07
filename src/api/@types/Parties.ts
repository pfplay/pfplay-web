import { PaginationPayload, PageResponse } from '@/api/@types/@shared';
import { Authority, PartyRoomStatus, PartyRoomType } from './@enums';

export interface CreatePartyRoomRequest {
  name: string;
  introduce: string; // FIXME: BE가 attribute name 수정 하면 수정 필요
  domain?: string;
  limit: number;
}

export interface PartyRoomParticipant {
  nickname: string;
  faceUrl: string;
}
export interface PartyRoomSummary {
  roomId: number;
  introduce: string;
  name: string;
  domain: string;
  createdAt: string;
  participantTotalCount: number;
  participants: PartyRoomParticipant[];
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
  create(request: CreatePartyRoomRequest): Promise<CreatePartyRoomResponse>;
  getList(request: PaginationPayload): Promise<PageResponse<PartyRoomSummary>>;
}
