'use client';

import { create } from 'zustand';
import { MotionType } from '@/shared/api/http/types/@enums';
import { Chat } from '@/shared/lib/chat';
import Observer from '@/shared/lib/functions/observer';
import { update } from '@/shared/lib/functions/update';
import * as AlertMessage from './alert-message.model';
import * as ChatMessage from './chat-message.model';
import * as CurrentPartyroom from './current-partyroom.model';
import { createPlaybackSummaryTracker } from './playback-summary-tracker';

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
      return set({
        reaction: {
          history: { isLiked: false, isDisliked: false, isGrabbed: false },
          aggregation: { likeCount: 0, dislikeCount: 0, grabCount: 0 },
          motion: [],
        },
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
    resetCrewsMotion: () => {
      return set((state) => {
        const updated = state.crews.map((crew) => ({
          ...crew,
          motionType: MotionType.NONE,
        }));

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

    // chat과 동일한 인스턴스 필드 — init/reset에도 레퍼런스 유지, 정리는 L1/L2 배선이 담당
    playbackSummaryTracker: createPlaybackSummaryTracker(),

    alert: new Observer<AlertMessage.Model>(),

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
        state.playbackSummaryTracker.clear(); // L1/L2 배선의 심층방어 — 방 퇴장 시 스냅샷 잔존 방지

        return api.getInitialState(); // chat의 레퍼런스는 변경되지 않을 것으로 기대 중. TODO: 테스트 필요
      }, true);
    },
  }));
};
