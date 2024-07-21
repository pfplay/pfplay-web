import { Singleton } from '@/shared/lib/decorators/singleton';
import {
  DjingQueue,
  GetDjingQueuePayload,
  GetMembersPayload,
  GetSetupInfoPayload,
  GetSetUpInfoResponse,
  PartyroomMemberSummary,
  PartyroomsClient,
  PartyroomSummary,
} from 'shared/api/http/types/partyrooms';
import HTTPClient from '../client/client';

@Singleton
class PartyroomsService extends HTTPClient implements PartyroomsClient {
  private ROUTE_V1 = 'v1/partyrooms';

  public getList = () => {
    return this.get<PartyroomSummary[]>(`${this.ROUTE_V1}`);
  };

  public getSetupInfo = ({ partyroomId }: GetSetupInfoPayload) => {
    return this.get<GetSetUpInfoResponse>(`${this.ROUTE_V1}/${partyroomId}/setup`);
  };

  public getMembers = ({ partyroomId }: GetMembersPayload) => {
    return this.get<PartyroomMemberSummary[]>(`${this.ROUTE_V1}/${partyroomId}/members`);
  };

  public getDjingQueue = ({ partyroomId }: GetDjingQueuePayload) => {
    return this.get<DjingQueue>(`${this.ROUTE_V1}/${partyroomId}/dj-queue`);
  };
}

const instance = new PartyroomsService();
export default instance;
