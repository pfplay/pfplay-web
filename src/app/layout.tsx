import { Metadata } from 'next';
import { cookies } from 'next/headers';

import '@rainbow-me/rainbowkit/styles.css';
import '@/shared/ui/foundation/globals.css';

import { PropsWithChildren } from 'react';
import { ProfileHydration } from '@/entities/profile';
import { DomId } from '@/shared/config/dom-id';
import { Language } from '@/shared/lib/localization/constants';
import { LANGUAGE_COOKIE_KEY } from '@/shared/lib/localization/constants';
import { getServerDictionary } from '@/shared/lib/localization/get-server-dictionary';
import { I18nProvider } from '@/shared/lib/localization/i18n.context';
import { DialogProvider } from '@/shared/ui/components/dialog';
import { pretendardVariable } from '@/shared/ui/foundation/fonts';
import { ReactQueryProvider } from './_providers/react-query.provider';
import { SessionProvider } from './_providers/session.provider';

export const metadata: Metadata = {
  title: 'PFPlay',
  description: 'PFP Playground for music',
  icons: {
    icon: '/favicon.ico',
  },
};

const RootLayout = async ({ children }: PropsWithChildren) => {
  const dictionary = await getServerDictionary();
  const lang = cookies().get(LANGUAGE_COOKIE_KEY)?.value || Language.En;

  return (
    <html lang={lang}>
      <body className={pretendardVariable.className}>
        <ReactQueryProvider>
          <SessionProvider>
            <I18nProvider dictionary={dictionary}>
              <DialogProvider>
                {/* FIXME: 인증 레이아웃에서만 필요할 수 있음. protect route 처리할 때 옮기기 */}
                <ProfileHydration>{children}</ProfileHydration>
              </DialogProvider>
            </I18nProvider>
          </SessionProvider>
        </ReactQueryProvider>

        <div id={DomId.TooltipRoot} />
      </body>
    </html>
  );
};

export default RootLayout;
