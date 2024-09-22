import { ReactNode, useMemo, useState } from 'react';
import { Panel, PanelControllerContext, usePanelController } from './panel-controller.context';

export const PanelController = Object.assign(PanelControllerProvider, {
  Panel: PanelRender,
});

function PanelControllerProvider({ children }: { children: ReactNode }) {
  const [currentPanel, setCurrentPanel] = useState(Panel.Main);

  const contextValue = useMemo(
    () => ({
      currentPanel,
      goTo: (panel: Panel) => {
        setCurrentPanel(panel);
      },
    }),
    [currentPanel]
  );

  return (
    <PanelControllerContext.Provider value={contextValue}>
      {children}
    </PanelControllerContext.Provider>
  );
}

function PanelRender({ panel, children }: { panel: Panel; children: ReactNode }) {
  const { currentPanel } = usePanelController();

  return currentPanel === panel ? children : null;
}
