import { ErrorCode } from '@/shared/api/http/types/@shared';
import { Singleton } from '@/shared/lib/decorators/singleton';
import { SkipGlobalErrorHandling } from '@/shared/lib/decorators/skip-global-error-handling';
import HTTPClient from '../client/client';
import { getErrorCode } from '../error/get-error-code';
import type {
  DjingQueue,
  GetPartyroomByLinkPayload,
  GetPartyroomByLinkResponse,
  EnterPayload,
  EnterResponse,
  ExitPayload,
  GetDjingQueuePayload,
  GetNoticePayload,
  GetNoticeResponse,
  GetSetupInfoPayload,
  GetSetUpInfoResponse,
  MyActivePartyroom,
  PartyroomsClient,
  PartyroomDetailSummary,
  ReactionPayload,
  AdjustGradePayload,
  GetPartyroomDetailSummaryPayload,
  ReactionResponse,
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
  DeleteDjFromQueuePayload,
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

  public getDjingQueue({ partyroomId }: GetDjingQueuePayload) {
    return this.get<DjingQueue>(`${this.ROUTE_V1}/${partyroomId}/dj-queue`);
  }

  public changeDjQueueStatus({ partyroomId, ...body }: ChangeDjQueueStatusPayload) {
    return this.put<void>(`${this.ROUTE_V1}/${partyroomId}/dj-queue`, body);
  }

  public deleteDjFromQueue({ partyroomId, djId }: DeleteDjFromQueuePayload) {
    return this.delete<void>(`${this.ROUTE_V1}/${partyroomId}/dj-queue/${djId}`);
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
    return this.post<EnterResponse>(`${this.ROUTE_V1}/${partyroomId}/crews`);
  }

  /**
   * 내 활성 파티룸 스냅샷 조회 (web#477). 활성 방 없으면 서버가 204(본문 없음)를 주며,
   * 이때 응답 인터셉터(unwrapResponse)는 falsy(빈 문자열/undefined)를 반환하므로 `null` 로 정규화한다.
   * — 200 + {data:null} 로 주면 `response.data?.data ?? response.data` 가 래퍼를 벗기지 못하는 풋건이 있어
   *   서버 계약을 204 로 잡았다.
   */
  public async getMyActiveRoom() {
    const data = await this.get<MyActivePartyroom | '' | null>(`${this.ROUTE_V1}/me/active`);
    return data ? (data as MyActivePartyroom) : null;
  }

  public exit({ partyroomId }: ExitPayload) {
    return this.delete<void>(`${this.ROUTE_V1}/${partyroomId}/crews/me`);
  }

  public reaction({ partyroomId, ...body }: ReactionPayload) {
    return this.post<ReactionResponse>(`${this.ROUTE_V1}/${partyroomId}/playbacks/reaction`, body);
  }

  public adjustGrade({ partyroomId, crewId, ...body }: AdjustGradePayload) {
    return this.patch<void>(`${this.ROUTE_V1}/${partyroomId}/crews/${crewId}/grade`, body);
  }

  public getPartyroomByLink({ linkDomain }: GetPartyroomByLinkPayload) {
    return this.get<GetPartyroomByLinkResponse>(`${this.ROUTE_V1}/link/${linkDomain}`);
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
