'use client';

import { create } from 'zustand';
import { PartyroomMember } from '@/shared/api/http/types/partyrooms';
import { Chat } from '@/shared/lib/chat';
import { warnLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';
import { update } from '@/shared/lib/functions/update';
import * as ChatMessage from './chat-message.model';
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

    members: [],
    updateMembers: (next) => {
      return set((state) => {
        const updated = update(state.members, next);

        return {
          members: updated,
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
    appendChatMessage: (memberId, content) => {
      return set((state) => {
        const member = state.members.find((member) => member.memberId === memberId);
        if (!member) {
          logMemberNotFound(memberId, state.members);
          return state;
        }

        state.chat.appendMessage({
          member,
          content,
          receivedAt: Date.now(),
        });

        return state;
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

function logMemberNotFound(memberId: number, currentMembers: PartyroomMember[]) {
  warnLogger(
    `Cannot find member(memberId: ${memberId}) in stored members for chat. current members: ${JSON.stringify(
      currentMembers,
      null,
      2
    )}`
  );
}
