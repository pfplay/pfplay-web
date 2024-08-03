'use client';

import { create } from 'zustand';
import { warnLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';
import { update } from '@/shared/lib/functions/update';
import theme from '@/shared/ui/foundation/theme';
import * as UIState from './ui-state.model';

const logger = withDebugger(0);
const log = logger(warnLog);

export const createUIStateStore = () => {
  return create<UIState.Model>((set, _, api) => ({
    playlistDrawer: {
      open: false,
      interactable: true,
      zIndex: theme.zIndex.drawer,
      selectedPlaylist: undefined,
    },
    setPlaylistDrawer: (v) => {
      return set((state) => {
        const updated = update(state.playlistDrawer, v);

        if (!updated.open) {
          resetValues('interactable', 'zIndex', 'selectedPlaylist');

          function resetValues<K extends keyof UIState.Model['playlistDrawer']>(...keys: K[]) {
            const initialValues = api.getInitialState().playlistDrawer;

            keys.forEach((key) => {
              if (updated[key] !== initialValues[key]) {
                log(`플레이리스트가 닫혀 ${key}가 초기 값으로 변경됩니다.`);
                updated[key] = initialValues[key];
              }
            });
          }
        }

        return {
          playlistDrawer: updated,
        };
      });
    },
  }));
};
