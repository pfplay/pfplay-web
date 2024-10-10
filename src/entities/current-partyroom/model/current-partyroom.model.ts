import { GradeType, PenaltyType } from '@/shared/api/http/types/@enums';
import { PartyroomPlayback, PartyroomReaction } from '@/shared/api/http/types/partyrooms';
import { ChatEvent } from '@/shared/api/websocket/types/partyroom';
import { Chat } from '@/shared/lib/chat';
import type { Next } from '@/shared/lib/functions/update';
import * as ChatMessage from './chat-message.model';
import * as Crew from './crew.model';

export type MyPartyroomInfo = {
  crewId: number;
  gradeType: GradeType;
};

export type PenaltyNotification = {
  punishedId: number;
  penaltyType: PenaltyType;
  detail: string;
};

export type Model = {
  id?: number;

  me?: MyPartyroomInfo;
  updateMe: (next: Next<MyPartyroomInfo | undefined>) => void;

  playbackActivated: boolean;
  updatePlaybackActivated: (next: boolean) => void;

  playback?: PartyroomPlayback;
  updatePlayback: (next: Next<PartyroomPlayback | undefined>) => void;

  reaction?: PartyroomReaction;
  updateReaction: (next: Next<PartyroomReaction | undefined>) => void;

  crews: Crew.Model[];
  updateCrews: (next: Next<Crew.Model[]>) => void;

  currentDj?: Pick<Crew.Model, 'crewId'>;
  updateCurrentDj: (next: Pick<Crew.Model, 'crewId'> | undefined) => void;

  notice: string;
  updateNotice: (next: string) => void;

  /**
   * NOTE: chat은 zustand와는 별개의 구독 매커니즘을 가지고 있는 모듈입니다.
   * chat message list의 리액트 내 구독을 위해선 이 슬라이스에서 제공하는 useCurrentPartyroomChat hook을 사용하세요
   */
  chat: Chat<ChatMessage.Model>;
  appendChatMessage: (crewId: number, message: ChatEvent['message']) => void;

  /**
   * 채팅 메세지 삭제 시 호출되는 함수입니다
   */
  updateChatMessage: (
    predicate: (message: ChatMessage.Model) => boolean,
    updater: (message: ChatMessage.Model) => ChatMessage.Model
  ) => void;

  /**
   * 패널티 전파
   */
  penaltyNotification?: PenaltyNotification;
  setPenaltyNotification: (notification: PenaltyNotification | undefined) => void;

  init: (
    next: Pick<
      Model,
      'id' | 'me' | 'playbackActivated' | 'playback' | 'reaction' | 'crews' | 'currentDj' | 'notice'
    >
  ) => void;
  reset: () => void;
};
