import {
  AuthorityTier,
  GradeType,
  MotionType,
  QueueStatus,
  StageType,
} from '@/shared/api/http/types/@enums';

export type PartyroomSummary = {
  partyroomId: number;
  stageType: StageType;
  title: string;
  introduction: string;
  memberCount: number;
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

export type PartyroomMember = {
  uid: string;
  authorityTier: AuthorityTier;
  memberId: number;
  nickname: string;
  gradeType: GradeType;
  avatarBodyUri: string;
  /**
   * not combinable body일 경우 빈 문자열
   */
  avatarFaceUri: string;
  combinePositionX: number;
  combinePositionY: number;
};

export type PartyroomPlayback = {
  name: string;
  linkId: string;
  duration: string; // 00:00 형식의 문자열
  endTime: string; // 00:00:00 형식의 문자열. UTC 기준
};

export type PartyroomReaction = {
  /**
   * 이전에 '내가' 클릭했는지 여부
   */
  history: {
    like: boolean;
    dislike: boolean;
    grab: boolean;
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
    memberIds: number[];
  }[];
};

export type GetSetUpInfoResponse = {
  members: PartyroomMember[];
  display: {
    /**
     * false 인 경우 playback과 reaction이 null
     */
    playbackActivated: boolean;
    playback?: PartyroomPlayback;
    reaction?: PartyroomReaction;
  };
};

export type GetMembersPayload = {
  partyroomId: number;
};

export type PartyroomMemberSummary = {
  uid: string;
  authorityTier: AuthorityTier;
  memberId: number;
  nickname: string;
  gradeType: GradeType;
  avatarIconUri: string;
};

export type GetDjingQueuePayload = {
  partyroomId: number;
};

export type Dj = {
  djId: number;
  orderNumber: number;
  nickname: string;
  avatarIconUri: string;
};

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

export type EnterPayload = {
  partyroomId: number;
};

export type EnterResponse = {
  uid: string;
  authorityTier: AuthorityTier;
  nickname: string;
  memberId: number;
  gradeType: GradeType;
  host: boolean;
};

export type ExitPayload = {
  partyroomId: number;
};

export interface PartyroomsClient {
  /**
   * 파티룸 목록 조회
   */
  getList: () => Promise<PartyroomSummary[]>;
  /**
   * 파티룸 초기화 정보 조회
   */
  getSetupInfo: (payload: GetSetupInfoPayload) => Promise<GetSetUpInfoResponse>;
  /**
   * 우측 사이드 바의 ‘전체’ 탭을 눌렀을 시 호출하는 현재 파티룸 내의 파티 멤버 목록 조회
   */
  getMembers: (payload: GetMembersPayload) => Promise<PartyroomMemberSummary[]>;
  /**
   * DJ 대기열 조회
   */
  getDjingQueue: (payload: GetDjingQueuePayload) => Promise<DjingQueue>;
  /**
   * 파티룸 입장
   */
  enter: (payload: EnterPayload) => Promise<EnterResponse>;
  /**
   * 파티룸 퇴장
   */
  exit: (payload: ExitPayload) => Promise<void>;
}
