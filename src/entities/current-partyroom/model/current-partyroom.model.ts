import { GradeType } from '@/shared/api/http/types/@enums';
import { PartyroomPlayback, PartyroomReaction } from '@/shared/api/http/types/partyrooms';
import { Chat } from '@/shared/lib/chat';
import Observer from '@/shared/lib/functions/observer';
import type { Next } from '@/shared/lib/functions/update';
import * as AlertMessage from './alert-message.model';
import * as ChatMessage from './chat-message.model';
import * as Crew from './crew.model';

type MyPartyroomInfo = {
  crewId: number;
  gradeType: GradeType;
};

export type Model = {
  /**
   * 파티룸 아이디
   */
  id?: number;

  /**
   * 파티룸에서 나갈 때 exit api를 기본적으로 호출하나,
   * 로그아웃했거나 강퇴되거나 등의 이유로 파티룸에서 나가는 경우에는 호출하지 않아야 하기에 그럴 때 체크하는 용도로 사용합니다.
   */
  exitedOnBackend: boolean;
  markExitedOnBackend: () => void;

  /**
   * 내 파티룸 정보
   */
  me?: MyPartyroomInfo;
  updateMe: (next: Next<MyPartyroomInfo | undefined>) => void;

  /**
   * 플레이백 활성화 여부
   */
  playbackActivated: boolean;
  updatePlaybackActivated: (next: boolean) => void;

  /**
   * 플레이백 정보
   */
  playback?: PartyroomPlayback;
  updatePlayback: (next: Next<PartyroomPlayback | undefined>) => void;

  /**
   * 전광판 리액션 정보 + 모션 정보
   */
  reaction: PartyroomReaction;
  updateReaction: (next: Next<PartyroomReaction>) => void;
  resetReaction: () => void;
  resetReactionAggregation: () => void;

  /**
   * 현재 파티룸 내 크루 목록
   */
  crews: Crew.Model[];
  updateCrews: (next: Next<Crew.Model[]>) => void;
  resetCrewsMotion: () => void;

  /**
   * 현재 DJ
   */
  currentDj?: Pick<Crew.Model, 'crewId'>;
  updateCurrentDj: (next: Pick<Crew.Model, 'crewId'> | undefined) => void;

  /**
   * 전광판 공지사항
   */
  notice: string;
  updateNotice: (next: string) => void;

  /**
   * 채팅 메세지 관리 모듈
   *
   * NOTE: chat은 zustand와는 별개의 구독 매커니즘을 가지고 있는 모듈입니다.
   * chat message list의 리액트 내 구독을 위해선 이 슬라이스에서 제공하는 useCurrentPartyroomChat hook을 사용하세요
   */
  chat: Chat<ChatMessage.Model>;
  /**
   * 채팅 메세지 추가 시 호출되는 함수입니다
   */
  appendChatMessage: (message: ChatMessage.Model) => void;
  /**
   * 채팅 메세지 삭제 시 호출되는 함수입니다
   */
  updateChatMessage: (
    predicate: (message: ChatMessage.Model) => boolean,
    updater: (message: ChatMessage.Model) => ChatMessage.Model
  ) => void;

  /**
   * 알리미 모듈
   * 킥, 꿀, 밴, grade 조정 등의 이벤트 발생 시 대상자에게 알림을 보내기 위한 모듈입니다.
   * 대개 이벤트 콜백에서 알림을 호출하며, 뷰 레이어에서 이를 구독하여 처리합니다.
   *
   * 전역 레퍼런스로 제공되어도 되지만 스토어로 제공하는 이유는, alert.notify는 주로 partyroom-client 슬라이스 내에서 호출되어
   * fsd의 동일 레이어 내 슬라이스 간 참조 금지 규칙을 지키기 위해서입니다.
   */
  alert: Observer<AlertMessage.Model>;

  /**
   * 파티룸 입장 시 초기화하는 함수
   */
  init: (
    next: Pick<Model, 'id' | 'me' | 'playbackActivated' | 'crews' | 'notice'> &
      Partial<Pick<Model, 'playback' | 'reaction' | 'currentDj'>>
  ) => void;

  /**
   * 파티룸 퇴장 시 리셋하는 함수
   */
  reset: () => void;
};
