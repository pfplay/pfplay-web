import {
  AuthorityTier,
  GradeType,
  MotionType,
  PartyroomGrade,
  QueueStatus,
  ReactionType,
  StageType,
} from '@/shared/api/http/types/@enums';

export type PartyroomSummary = {
  partyroomId: number;
  stageType: StageType;
  title: string;
  introduction: string;
  crewCount: number;
  /**
   * false 인 경우 playback이 null
   */
  playbackActivated: boolean;
  playback?: {
    name: string;
    thumbnailImage: string;
  };
  /**
   * 최소한 호스트 1명에 대한 정보는 있음
   */
  primaryIcons: {
    avatarIconUri: string;
  }[];
};

export type GetSetupInfoPayload = {
  partyroomId: number;
};

export type PartyroomCrew = {
  uid: string;
  authorityTier: AuthorityTier;
  crewId: number;
  nickname: string;
  gradeType: GradeType;
  avatarBodyUri: string;
  /**
   * not combinable body일 경우 빈 문자열
   */
  avatarFaceUri: string;
  avatarIconUri: string;
  combinePositionX: number;
  combinePositionY: number;
};

export type PartyroomPlayback = {
  id: number;
  name: string;
  linkId: string;
  duration: string; // 00:00 형식의 문자열
  thumbnailImage: string;
  endTime: number; // UTC 기준 UNIX timestamp, ex) 1722750394821
};

export type PartyroomReaction = {
  /**
   * 이전에 '내가' 클릭했는지 여부
   */
  history: {
    isLiked: boolean;
    isDisliked: boolean;
    isGrabbed: boolean;
  };
  /**
   * 현재까지의 반응 수
   */
  aggregation: {
    likeCount: number;
    dislikeCount: number;
    grabCount: number;
  };
  /**
   * 춤추고 있는 유저들의 정보
   */
  motion: {
    motionType: MotionType;
    crewIds: number[];
  }[];
};

export type GetSetUpInfoResponse = {
  crews: PartyroomCrew[];
  display: {
    /**
     * false 인 경우 playback과 reaction이 null
     */
    playbackActivated: boolean;
    playback?: PartyroomPlayback;
    reaction?: PartyroomReaction;
    currentDj?: Pick<PartyroomCrew, 'crewId'>;
  };
};

export type GetCrewsPayload = {
  partyroomId: number;
};

export type PartyroomCrewSummary = {
  uid: string;
  authorityTier: AuthorityTier;
  crewId: number;
  nickname: string;
  gradeType: GradeType;
  avatarIconUri: string;
};

export type GetDjingQueuePayload = {
  partyroomId: number;
};

export type Dj = {
  crewId: number;
  orderNumber: number;
  nickname: string;
  avatarIconUri: string;
};

export interface Participant {
  uid: string;
  partyroomGrade: PartyroomGrade;
  nickname: string;
  crewId: number;
  gradeType: GradeType;
  avatarIconUri: string;
}

export type DjingQueue = {
  playbackActivated: boolean;
  /**
   * 대기열 잠금 여부
   */
  queueStatus: QueueStatus;
  /**
   * 본인이 대기열에 등록되었는지 여부
   */
  isRegistered: boolean;
  playback?: {
    name: string;
    thumbnailImage: string;
  };
  /**
   * Dj 대기열에 1명만 존재하는 상황에서 새로운 Dj가 대기열에 추가된다고 가정하면, 현재 재생곡이 끝난다면 새로운 Dj에게 차례를 넘기는 것이 자연스럽다.
   * 이것은 순서 회전이 곡 완료를 기점으로 연산되어야 한다는 의미이다. 즉, 언제나 orderNumber가 1인 Dj는 현재 재생곡의 Dj이다.
   */
  djs: Dj[];
};

export type GetNoticePayload = {
  partyroomId: number;
};

export type GetNoticeResponse = {
  content?: string;
};

export type EnterPayload = {
  partyroomId: number;
};

export type GetPartyroomSummaryPayload = {
  partyroomId: number;
};

export type GetPlaybackHistoryPayload = {
  partyroomId: number;
};

export type PlaybackHistoryItem = {
  musicName: string;
  nickname: string;
  avatarIconUri: string;
};

export type EnterResponse = {
  crewId: number;
  gradeType: GradeType;
};

export type ExitPayload = {
  partyroomId: number;
};

export type AdjustGradePayload = {
  partyroomId: number;
  crewId: number;
  gradeType: GradeType;
};

export type ReactionPayload = {
  partyroomId: number;
  reactionType: ReactionType;
};

export interface PartyroomsClient {
  /**
   * 파티룸 목록 조회
   */
  getList: () => Promise<PartyroomSummary[]>;
  /**
   * 파티룸 정보 조회
   */
  getPartyroomSummary: (payload: GetPartyroomSummaryPayload) => Promise<PartyroomSummary>;
  /**
   * 파티룸 초기화 정보 조회
   */
  getSetupInfo: (payload: GetSetupInfoPayload) => Promise<GetSetUpInfoResponse>;
  /**
   * 우측 사이드 바의 ‘전체’ 탭을 눌렀을 시 호출하는 현재 파티룸 내의 파티 멤버 목록 조회
   */
  getCrews: (payload: GetCrewsPayload) => Promise<PartyroomCrewSummary[]>;
  /**
   * DJ 대기열 조회
   */
  getDjingQueue: (payload: GetDjingQueuePayload) => Promise<DjingQueue>;
  /**
   * 공지사항 조회
   */
  getNotice: (payload: GetNoticePayload) => Promise<GetNoticeResponse>;
  /**
   * 플레이백 히스토리 조회
   */
  getPlaybackHistory: (payload: GetPlaybackHistoryPayload) => Promise<PlaybackHistoryItem[]>;
  /**
   * 파티룸 입장
   */
  enter: (payload: EnterPayload) => Promise<EnterResponse>;
  /**
   * 파티룸 퇴장
   */
  exit: (payload: ExitPayload) => Promise<void>;
  /**
   * 현재 playback에 대한 반응 (좋아요 / 싫어요 / 찜하기)
   * 동사형은 라이브러리명과 겹치므로 일부러 안씀
   */
  reaction: (payload: ReactionPayload) => Promise<void>;
  /**
   * 등급 조정
   */
  adjustGrade: (payload: AdjustGradePayload) => Promise<void>;
}
