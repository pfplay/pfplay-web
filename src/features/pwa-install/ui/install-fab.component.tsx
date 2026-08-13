'use client';

import { FC } from 'react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import useInstallGuide from './use-install-guide.hook';

// z-10 은 드로어(30)·다이얼로그(1000) 미만 — 그것들이 열리면 FAB 가 그 아래로 가려진다.
const InstallFab: FC = () => {
  const t = useI18n();
  const { canInstall, openInstallGuide } = useInstallGuide();

  if (!canInstall) return null;

  return (
    <Button
      size='lg'
      onClick={openInstallGuide}
      className='fixed bottom-6 right-4 z-10 rounded-full shadow-lg'
    >
      {t.pwa.menu_label}
    </Button>
  );
};

export default InstallFab;
