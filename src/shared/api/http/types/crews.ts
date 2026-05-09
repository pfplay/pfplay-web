import { ActivitySummary } from './users';

export type BlockedCrew = {
  blockId: number;
  blockedCrewId: number;
  nickname: string;
  avatarIconUri: string;
};

export type BlockCrewPayload = {
  crewId: number;
};

export type UnblockCrewPayload = {
  blockId: number;
};

export type GetCrewProfileSummaryRequest = {
  crewId: number;
};

export type GetCrewProfileSummaryResponse = {
  crewId: number;
  nickname: string;
  introduction?: string;
  avatarBodyUri: string;
  avatarFaceUri: string;
  combinePositionX?: number;
  combinePositionY?: number;
  activitySummaries: ActivitySummary[];
};

export interface CrewsClient {
  /**
   * 내가 채팅 차단한 크루 목록 조회
   */
  getBlockedCrews: () => Promise<BlockedCrew[]>;
  /**
   * 채팅 차단 적용
   */
  blockCrew: (payload: BlockCrewPayload) => Promise<void>;
  /**
   * 채팅 차단 해제
   */
  unblockCrew: (payload: UnblockCrewPayload) => Promise<void>;
  /**
   * 다른 크루 프로필 요약 조회
   */
  getCrewProfileSummary: (
    request: GetCrewProfileSummaryRequest
  ) => Promise<GetCrewProfileSummaryResponse>;
}
