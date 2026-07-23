'use client';

import { FC } from 'react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import useInstallGuide from './use-install-guide.hook';

/**
 * 모바일 로비 우측 하단에 떠 있는 설치 진입점.
 *
 * 로비에만 둔다 — 파티룸은 화면이 이미 꽉 차 있고, 설치를 권할 만한 시점은 앱을 계속
 * 쓸 마음이 생기는 로비다. 로비 한 화면뿐이라 닫기 버튼은 두지 않았다: 설치하면
 * `canInstall` 이 false 가 되어 알아서 사라진다.
 *
 * `z-drawer`(30) 미만이라 드로어·다이얼로그가 열리면 그 아래로 가려진다.
 */
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
