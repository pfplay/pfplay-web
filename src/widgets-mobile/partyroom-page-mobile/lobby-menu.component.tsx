'use client';

import { FC, useState } from 'react';
import { useInstallGuide } from '@/features/pwa-install';
import { useSignOut } from '@/features/sign-out';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useAppRouter } from '@/shared/lib/router/use-app-router.hook';
import { Drawer } from '@/shared/ui/components/drawer';

/**
 * 모바일 로비 헤더의 ⋮ 오버플로우 메뉴 (Web Push 알림 설정 진입점).
 *
 * 데스크탑은 진입점 없음(의도) — 설치형 모바일 PWA 가 push 타깃이므로 모바일 로비의
 * 이 메뉴만 `/settings/notifications` 로 이어진다.
 *
 * surface 는 앱 기존 우측 고정 `Drawer`(z-drawer=30) 재사용. 로그아웃 확인 다이얼로그는
 * z-dialog(1000) 로 드로어 위에 뜨지만, UX 상 드로어를 먼저 닫고 `signOut()` 을 호출한다.
 */
const LobbyMenu: FC = () => {
  const t = useI18n();
  const router = useAppRouter();
  const signOut = useSignOut();
  const { canInstall, openInstallGuide } = useInstallGuide();
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const goNotificationSettings = () => {
    close();
    router.push('/settings/notifications');
  };

  const handleInstall = () => {
    close();
    openInstallGuide();
  };

  const handleSignOut = () => {
    close();
    signOut();
  };

  return (
    <>
      <button
        aria-label='메뉴'
        onClick={open}
        className='w-11 h-11 flex items-center justify-center text-gray-300'
      >
        ⋮
      </button>
      <Drawer title={t.common.menu.title} isOpen={isOpen} close={close}>
        <nav className='flexCol'>
          {canInstall && (
            <button
              type='button'
              onClick={handleInstall}
              data-testid='lobby-menu-install-app'
              className='h-12 flex items-center text-left text-white active:bg-gray-900 -mx-7 px-7'
            >
              {t.pwa.menu_label}
            </button>
          )}
          <button
            type='button'
            onClick={goNotificationSettings}
            className='h-12 flex items-center text-left text-white active:bg-gray-900 -mx-7 px-7'
          >
            {t.common.menu.notification_settings}
          </button>
          <button
            type='button'
            onClick={handleSignOut}
            className='h-12 flex items-center text-left text-gray-300 active:bg-gray-900 -mx-7 px-7'
          >
            {t.common.btn.logout}
          </button>
        </nav>
      </Drawer>
    </>
  );
};

export default LobbyMenu;
