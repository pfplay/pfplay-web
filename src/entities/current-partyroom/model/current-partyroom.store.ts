'use client';

import { create } from 'zustand';
import { Chat } from '@/shared/lib/chat';
import { update } from '@/shared/lib/functions/update';
import Alert from './alert.model';
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

    reaction: {
      history: {
        isLiked: false,
        isDisliked: false,
        isGrabbed: false,
      },
      aggregation: {
        likeCount: 0,
        dislikeCount: 0,
        grabCount: 0,
      },
      motion: [],
    },
    updateReaction: (next) => {
      return set((state) => {
        const updated = update(state.reaction, next);

        return {
          reaction: updated,
        };
      });
    },
    resetReaction: () => {
      return set((state) => {
        state.reaction = api.getInitialState().reaction;

        return state;
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
    appendChatMessage: (newChat) => {
      return set((state) => {
        state.chat.appendMessage(newChat);
        return state;
      });
    },
    updateChatMessage: (predicate, updater) => {
      return set((state) => {
        state.chat.updateMessage(predicate, updater);
        return state;
      });
    },

    alert: new Alert(),

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
