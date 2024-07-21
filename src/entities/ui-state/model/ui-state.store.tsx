'use client';

import { create } from 'zustand';
import { warnLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';
import { update } from '@/shared/lib/functions/update';
import * as UIState from './ui-state.model';

const logger = withDebugger(0);
const log = logger(warnLog);

const useUIState = create<UIState.Model>((set) => ({
  playlistDrawer: {
    ...UIState.initialValues.playlistDrawer,
  },
  setPlaylistDrawer: (v) => {
    return set((state) => {
      const updated = update(state.playlistDrawer, v);

      if (!updated.open) {
        resetValues('interactable', 'zIndex', 'selectedPlaylist');

        function resetValues<K extends keyof UIState.Model['playlistDrawer']>(...keys: K[]) {
          keys.forEach((key) => {
            if (updated[key] !== UIState.initialValues.playlistDrawer[key]) {
              log(`플레이리스트가 닫혀 ${key}가 초기 값으로 변경됩니다.`);
              updated[key] = UIState.initialValues.playlistDrawer[key];
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

export default useUIState;
