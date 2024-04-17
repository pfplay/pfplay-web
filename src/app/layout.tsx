import '@rainbow-me/rainbowkit/styles.css';
import '@/shared/ui/foundation/globals.css';

import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { PropsWithChildren } from 'react';
import { ProfileHydration } from '@/components/features/profile/profile-hydration.component';
import { DomId } from '@/constants/dom-id';
import { ReactQueryProvider } from '@/context/react-query.provider';
import { SessionProvider } from '@/context/session.provider';
import {
  getServerDictionary,
  Language,
  LANGUAGE_COOKIE_KEY,
  DictionaryProvider,
} from '@/entities/localization';
import { DialogProvider } from '@/shared/ui/components/dialog/dialog.provider';
import { pretendardVariable } from '@/shared/ui/foundation/fonts';

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
            <DictionaryProvider dictionary={dictionary}>
              <DialogProvider>
                {/* FIXME: 인증 레이아웃에서만 필요할 수 있음. protect route 처리할 때 옮기기 */}
                <ProfileHydration>{children}</ProfileHydration>
              </DialogProvider>
            </DictionaryProvider>
          </SessionProvider>
        </ReactQueryProvider>

        <div id={DomId.TooltipRoot} />
      </body>
    </html>
  );
};

export default RootLayout;
