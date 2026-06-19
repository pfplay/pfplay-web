import { Metadata } from 'next';
import { cookies } from 'next/headers';

import '@rainbow-me/rainbowkit/styles.css';
import '@/shared/ui/foundation/globals.css';
import '@/shared/ui/foundation/touch-reset.css';

import { PropsWithChildren } from 'react';

import { SystemAnnouncementSubscriber } from '@/features/system-announcement';
import {
  AnnouncementSnapshot,
  MaintenanceState,
} from '@/features/system-announcement/model/system-announcement.types';
import HydrateAnnouncementsFromStatus from '@/features/system-announcement/ui/hydrate-announcements-from-status';
import SystemAnnouncementDisplay from '@/features/system-announcement/ui/system-announcement-display';
import { getEdgeConfigMaintenance, getSystemStatus } from '@/shared/api/system-status';
import { DomId } from '@/shared/config/dom-id';
import { Language } from '@/shared/lib/localization/constants';
import { LANGUAGE_COOKIE_KEY } from '@/shared/lib/localization/constants';
import { getServerDictionary } from '@/shared/lib/localization/get-server-dictionary';
import { I18nProvider } from '@/shared/lib/localization/i18n.context';
import { LangProvider } from '@/shared/lib/localization/lang.context';
import { DialogProvider } from '@/shared/ui/components/dialog';
import { pretendardVariable } from '@/shared/ui/foundation/fonts';

import AnalyticsProvider from './_providers/analytics.provider';
import ReactQueryProvider from './_providers/react-query.provider';
import StoresProvider from './_providers/stores.provider';
import { WalletProvider } from './_providers/wallet.provider';

export const metadata: Metadata = {
  title: 'PFPlay',
  description: 'PFP Playground for music',
  icons: {
    icon: '/favicon.ico',
  },
};

const RootLayout = async ({ children }: PropsWithChildren) => {
  const lang = cookies().get(LANGUAGE_COOKIE_KEY)?.value || Language.En;

  // #406: 점검 ACTIVE 면 앱-부팅 기계(me-fetch · WS 구독 · 전역 에러 모달)를 마운트하지 않고
  // 점검 화면(middleware rewrite 로 주입된 children)만 inert 하게 렌더한다. 신뢰 소스는
  // Edge Config — middleware 와 동일하며, 점검 중 백엔드는 down 이라 getSystemStatus 로는 점검을
  // 알 수 없다(throw → null). EDGE_CONFIG 부재(로컬/test)면 null → 평소 트리로 통과.
  const maintenance = await getEdgeConfigMaintenance();
  if (maintenance?.phase === 'ACTIVE') {
    return (
      <html lang={lang}>
        <body className={pretendardVariable.className}>{children}</body>
      </html>
    );
  }

  const dictionary = await getServerDictionary();

  // Edge Config 가 unreachable 한 경우의 1차 fallback —
  // /v1/system/status 결과로 active announcements + maintenance 를 hydrate.
  // 호출 실패 시 통과 (ws + 503 인터셉터가 보정).
  let initialActiveAnnouncements: AnnouncementSnapshot[] = [];
  let initialMaintenance: MaintenanceState | null = null;
  try {
    const status = await getSystemStatus();
    initialActiveAnnouncements = status.activeAnnouncements;
    initialMaintenance = status.maintenance;
  } catch {
    // silent — 가용성 우선
  }

  return (
    <html lang={lang}>
      <body className={pretendardVariable.className}>
        <ReactQueryProvider>
          <AnalyticsProvider>
            <LangProvider lang={lang as Language}>
              <I18nProvider dictionary={dictionary}>
                <StoresProvider>
                  <WalletProvider>
                    <DialogProvider>
                      {children}
                      <HydrateAnnouncementsFromStatus
                        initialActive={initialActiveAnnouncements}
                        initialMaintenance={initialMaintenance}
                      />
                      <SystemAnnouncementSubscriber />
                      <SystemAnnouncementDisplay />
                    </DialogProvider>
                  </WalletProvider>
                </StoresProvider>
              </I18nProvider>
            </LangProvider>
          </AnalyticsProvider>
        </ReactQueryProvider>

        <div id={DomId.DrawerRoot} />
        <div id={DomId.TooltipRoot} className='pointer-events-none fixed inset-0 z-tooltip' />
      </body>
    </html>
  );
};

export default RootLayout;
