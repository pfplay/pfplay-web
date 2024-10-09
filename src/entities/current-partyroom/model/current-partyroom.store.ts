'use client';

import { create } from 'zustand';
import { Chat } from '@/shared/lib/chat';
import { warnLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';
import { update } from '@/shared/lib/functions/update';
import * as ChatMessage from './chat-message.model';
import * as Crew from './crew.model';
import * as CurrentPartyroom from '../model/current-partyroom.model';

export const createCurrentPartyroomStore = () => {
  return create<CurrentPartyroom.Model>((set, _, api) => ({
    id: undefined,

    me: undefined,
    updateMe: (next) => {
      return set((state) => {
        const updated = update(state.me, next);

        return {
          me: updated,
        };
      });
    },

    playbackActivated: false,
    updatePlaybackActivated: (next) => {
      return set({
        playbackActivated: next,
      });
    },

    playback: undefined,
    updatePlayback: (next) => {
      return set((state) => {
        const updated = update(state.playback, next);

        return {
          playback: updated,
        };
      });
    },

    reaction: undefined,
    updateReaction: (next) => {
      return set((state) => {
        const updated = update(state.reaction, next);

        return {
          reaction: updated,
        };
      });
    },

    crews: [],
    updateCrews: (next) => {
      return set((state) => {
        const updated = update(state.crews, next);

        return {
          crews: updated,
        };
      });
    },

    currentDj: undefined,
    updateCurrentDj: (next) => {
      return set({
        currentDj: next,
      });
    },

    notice: '',
    updateNotice: (next) => {
      return set({
        notice: next,
      });
    },

    chat: Chat.create<ChatMessage.Model>([]),
    appendChatMessage: (crewId, message) => {
      return set((state) => {
        const crew = state.crews.find((crew) => crew.crewId === crewId);
        if (!crew) {
          logCrewNotFound(crewId, state.crews);
          return state;
        }

        state.chat.appendMessage({
          from: 'user',
          crew,
          message,
          receivedAt: Date.now(),
        });

        return state;
      });
    },

    updateChatMessage: ({ messageId, content }) => {
      return set((state) => {
        state.chat.updateMessage(
          (message) => message.from === 'user' && message.message.messageId === messageId,
          () => ({
            from: 'system',
            content,
          })
        );

        return state;
      });
    },

    penaltyNotification: undefined,
    setPenaltyNotification: (penaltyNotification) => {
      return set({
        penaltyNotification,
      });
    },

    init: (next) => {
      return set(
        {
          ...api.getInitialState(),
          ...next,
        },
        true
      );
    },

    reset: () => {
      return set((state) => {
        state.chat.clear();

        return api.getInitialState(); // chat의 레퍼런스는 변경되지 않을 것으로 기대 중. TODO: 테스트 필요
      }, true);
    },
  }));
};

const logger = withDebugger(0);
const warnLogger = logger(warnLog);

function logCrewNotFound(crewId: number, currentCrews: Crew.Model[]) {
  warnLogger(
    `Cannot find crew(crewId: ${crewId}) in stored crews for chat. current crews: ${JSON.stringify(
      currentCrews,
      null,
      2
    )}`
  );
}
