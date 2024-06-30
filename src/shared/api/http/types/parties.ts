import { PartyroomGrade, PartyroomStatus, RedirectionableLocation } from './@enums';
import { PaginationPayload, PaginationResponse } from './@shared';

export interface CreatePartyroomRequest {
  name: string;
  introduce: string; // FIXME: BE가 attribute name 수정 하면 수정 필요
  domain?: string;
  limit: number;
}

export interface PartyroomParticipant {
  nickname: string;
  faceUrl: string;
}
export interface PartyroomSummary {
  roomId: number;
  introduce: string;
  name: string;
  domain: string;
  createdAt: string;
  participantTotalCount: number;
  participants: PartyroomParticipant[];
}

export type DefaultPartyPermission = {
  authority: PartyroomGrade;
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
export interface CreatePartyroomResponse {
  id: number;
  name: string;
  introduce: string;
  domain: string;
  djingLimit: number;
  type: RedirectionableLocation;
  status: PartyroomStatus;
  admin: {
    profile: string;
    userName: string;
  };
  defaultPartyPermission: DefaultPartyPermission;
}

export interface PartiesClient {
  create(request: CreatePartyroomRequest): Promise<CreatePartyroomResponse>;
  getList(request: PaginationPayload): Promise<PaginationResponse<PartyroomSummary>>;
}
