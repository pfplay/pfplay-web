import { Singleton } from '@/shared/lib/decorators/singleton';
import type {
  DjingQueue,
  EnterPayload,
  EnterResponse,
  ExitPayload,
  GetDjingQueuePayload,
  GetCrewsPayload,
  GetNoticePayload,
  GetNoticeResponse,
  GetSetupInfoPayload,
  GetSetUpInfoResponse,
  PartyroomCrewSummary,
  PartyroomsClient,
  PartyroomSummary,
  ReactionPayload,
  AdjustGradePayload,
  GetPartyroomSummaryPayload,
  ReactionResponse,
} from 'shared/api/http/types/partyrooms';
import HTTPClient from '../client/client';

@Singleton
class PartyroomsService extends HTTPClient implements PartyroomsClient {
  private ROUTE_V1 = 'v1/partyrooms';

  public getList = () => {
    return this.get<PartyroomSummary[]>(`${this.ROUTE_V1}`);
  };

  public getPartyroomSummary = ({ partyroomId }: GetPartyroomSummaryPayload) => {
    return this.get<PartyroomSummary>(`${this.ROUTE_V1}/${partyroomId}/summary`);
  };

  public getSetupInfo = ({ partyroomId }: GetSetupInfoPayload) => {
    return this.get<GetSetUpInfoResponse>(`${this.ROUTE_V1}/${partyroomId}/setup`);
  };

  public getCrews = ({ partyroomId }: GetCrewsPayload) => {
    return this.get<PartyroomCrewSummary[]>(`${this.ROUTE_V1}/${partyroomId}/crews`);
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
    return this.post<ReactionResponse>(`${this.ROUTE_V1}/${partyroomId}/playback/reaction`, body);
  };

  public adjustGrade = ({ partyroomId, crewId, ...body }: AdjustGradePayload) => {
    return this.put<void>(`${this.ROUTE_V1}/${partyroomId}/crews/${crewId}/grade`, body);
  };
}

const instance = new PartyroomsService();
export default instance;
