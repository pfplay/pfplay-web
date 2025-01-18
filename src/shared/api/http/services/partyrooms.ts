import { ErrorCode } from '@/shared/api/http/types/@shared';
import { Singleton } from '@/shared/lib/decorators/singleton';
import { SkipGlobalErrorHandling } from '@/shared/lib/decorators/skip-global-error-handling';
import HTTPClient from '../client/client';
import { getErrorCode } from '../error/get-error-code';
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
  GetRoomIdByDomainPayload,
  GetRoomIdByDomainResponse,
  PartyroomSummary,
  CreatePartyroomPayload,
  CreatePartyroomResponse,
  ChangeDjQueueStatusPayload,
  ImposePenaltyPayload,
  EditPartyroomPayload,
  ClosePartyroomPayload,
  LiftPenaltyPayload,
  GetPenaltyListPayload,
  Penalty,
} from '../types/partyrooms';

@Singleton
export default class PartyroomsService extends HTTPClient implements PartyroomsClient {
  private ROUTE_V1 = 'v1/partyrooms';

  public create(payload: CreatePartyroomPayload) {
    return this.post<CreatePartyroomResponse>(this.ROUTE_V1, payload);
  }

  public edit({ partyroomId, ...body }: EditPartyroomPayload) {
    return this.put<void>(`${this.ROUTE_V1}/${partyroomId}`, body);
  }

  public getList() {
    return this.get<PartyroomSummary[]>(`${this.ROUTE_V1}`);
  }

  public close(payload: ClosePartyroomPayload) {
    return this.delete<void>(`${this.ROUTE_V1}/${payload.partyroomId}`);
  }

  public getPartyroomDetailSummary({ partyroomId }: GetPartyroomDetailSummaryPayload) {
    return this.get<PartyroomDetailSummary>(`${this.ROUTE_V1}/${partyroomId}/summary`);
  }

  public getSetupInfo({ partyroomId }: GetSetupInfoPayload) {
    return this.get<GetSetUpInfoResponse>(`${this.ROUTE_V1}/${partyroomId}/setup`);
  }

  public getCrews({ partyroomId }: GetCrewsPayload) {
    return this.get<PartyroomCrewSummary[]>(`${this.ROUTE_V1}/${partyroomId}/crews`);
  }

  public getDjingQueue({ partyroomId }: GetDjingQueuePayload) {
    return this.get<DjingQueue>(`${this.ROUTE_V1}/${partyroomId}/dj-queue`);
  }

  public changeDjQueueStatus({ partyroomId, ...body }: ChangeDjQueueStatusPayload) {
    return this.put<void>(`${this.ROUTE_V1}/${partyroomId}/dj-queue`, body);
  }

  public getNotice({ partyroomId }: GetNoticePayload) {
    return this.get<GetNoticeResponse>(`${this.ROUTE_V1}/${partyroomId}/notice`);
  }

  @SkipGlobalErrorHandling({
    when: (error) =>
      [ErrorCode.NOT_FOUND_ROOM, ErrorCode.ALREADY_TERMINATED, ErrorCode.EXCEEDED_LIMIT].includes(
        getErrorCode(error) as ErrorCode
      ),
  })
  public enter({ partyroomId }: EnterPayload) {
    return this.post<EnterResponse>(`${this.ROUTE_V1}/${partyroomId}/enter`);
  }

  public exit({ partyroomId }: ExitPayload) {
    return this.post<void>(`${this.ROUTE_V1}/${partyroomId}/exit`);
  }

  public reaction({ partyroomId, ...body }: ReactionPayload) {
    return this.post<ReactionResponse>(`${this.ROUTE_V1}/${partyroomId}/playbacks/reaction`, body);
  }

  public adjustGrade({ partyroomId, crewId, ...body }: AdjustGradePayload) {
    return this.patch<void>(`${this.ROUTE_V1}/${partyroomId}/crews/${crewId}/grade`, body);
  }

  public getRoomIdByDomain({ domain }: GetRoomIdByDomainPayload) {
    return this.get<GetRoomIdByDomainResponse>(`${this.ROUTE_V1}/link/${domain}/enter`);
  }

  public getPenaltyList({ partyroomId }: GetPenaltyListPayload) {
    return this.get<Penalty[]>(`${this.ROUTE_V1}/${partyroomId}/penalties`);
  }

  public imposePenalty({ partyroomId, ...body }: ImposePenaltyPayload) {
    return this.post<void>(`${this.ROUTE_V1}/${partyroomId}/penalties`, body);
  }

  public liftPenalty({ partyroomId, penaltyId }: LiftPenaltyPayload) {
    return this.delete<void>(`${this.ROUTE_V1}/${partyroomId}/penalties/${penaltyId}`);
  }
}
