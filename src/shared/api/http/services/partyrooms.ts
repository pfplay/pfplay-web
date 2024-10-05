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
  PartyroomDetailSummary,
  ReactionPayload,
  AdjustGradePayload,
  GetPartyroomDetailSummaryPayload,
  ReactionResponse,
  GetPlaybackHistoryPayload,
  PlaybackHistoryItem,
  GetRoomIdByDomainPayload,
  GetRoomIdByDomainResponse,
  PartyroomSummary,
  CreatePartyroomPayload,
  CreatePartyroomResponse,
  ImposePenaltyPayload,
} from 'shared/api/http/types/partyrooms';
import HTTPClient from '../client/client';

@Singleton
class PartyroomsService extends HTTPClient implements PartyroomsClient {
  private ROUTE_V1 = 'v1/partyrooms';

  public create = (payload: CreatePartyroomPayload) => {
    return this.post<CreatePartyroomResponse>(this.ROUTE_V1, payload);
  };

  public getList = () => {
    return this.get<PartyroomSummary[]>(`${this.ROUTE_V1}`);
  };

  public getPartyroomDetailSummary = ({ partyroomId }: GetPartyroomDetailSummaryPayload) => {
    return this.get<PartyroomDetailSummary>(`${this.ROUTE_V1}/${partyroomId}/summary`);
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

  public getPlaybackHistory = ({ partyroomId }: GetPlaybackHistoryPayload) => {
    return this.get<PlaybackHistoryItem[]>(`${this.ROUTE_V1}/${partyroomId}/playbacks/histories`);
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

  public getRoomIdByDomain = ({ domain }: GetRoomIdByDomainPayload) => {
    return this.get<GetRoomIdByDomainResponse>(`${this.ROUTE_V1}/link/${domain}/enter`);
  };

  public imposePenalty = ({ partyroomId, crewId, ...body }: ImposePenaltyPayload) => {
    return this.post<void>(`${this.ROUTE_V1}/${partyroomId}/crews/${crewId}/penalties`, body);
  };
}

const instance = new PartyroomsService();
export default instance;
