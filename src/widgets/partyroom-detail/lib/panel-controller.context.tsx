import { createContext, useContext } from 'react';

export const enum Panel {
  Main,
  PlaybackHistory,
}

export type PanelController = {
  currentPanel: Panel;
  goTo: (panel: Panel) => void;
};

export const PanelControllerContext = createContext<PanelController | null>(null);

export const usePanelController = () => {
  const context = useContext(PanelControllerContext);

  if (!context) {
    throw new Error('usePanelController must be used within a PanelControllerContext.Provider');
  }

  return context;
};
