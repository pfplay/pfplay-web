import { Singleton } from '@/shared/lib/decorators/singleton';
import type {
  DjingQueue,
  EnterPayload,
  EnterResponse,
  ExitPayload,
  GetDjingQueuePayload,
  GetMembersPayload,
  GetNoticePayload,
  GetNoticeResponse,
  GetSetupInfoPayload,
  GetSetUpInfoResponse,
  PartyroomMemberSummary,
  PartyroomsClient,
  PartyroomSummary,
  ReactionPayload,
  AdjustGradePayload,
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

  public getNotice = ({ partyroomId }: GetNoticePayload) => {
    return this.get<GetNoticeResponse>(`${this.ROUTE_V1}/${partyroomId}/notice`);
  };

  public enter = ({ partyroomId }: EnterPayload) => {
    return this.post<EnterResponse>(`${this.ROUTE_V1}/${partyroomId}/enter`);
  };

  public exit = ({ partyroomId }: ExitPayload) => {
    return this.post<void>(`${this.ROUTE_V1}/${partyroomId}/exit`);
  };

  public reaction = ({ partyroomId, ...body }: ReactionPayload) => {
    return this.post<void>(`${this.ROUTE_V1}/${partyroomId}/playback/reaction`, body);
  };

  public adjustGrade = ({ partyroomId, memberId, ...body }: AdjustGradePayload) => {
    return this.put<void>(`${this.ROUTE_V1}/${partyroomId}/partymembers/${memberId}/grade`, body);
  };
}

const instance = new PartyroomsService();
export default instance;
