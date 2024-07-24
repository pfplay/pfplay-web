import { Metadata } from 'next';
import { cookies } from 'next/headers';

import '@rainbow-me/rainbowkit/styles.css';
import '@/shared/ui/foundation/globals.css';

import { PropsWithChildren } from 'react';
import StoresProvider from '@/app/_providers/stores.provider';
import { MeHydration } from '@/entities/me';
import { DomId } from '@/shared/config/dom-id';
import { Language } from '@/shared/lib/localization/constants';
import { LANGUAGE_COOKIE_KEY } from '@/shared/lib/localization/constants';
import { getServerDictionary } from '@/shared/lib/localization/get-server-dictionary';
import { I18nProvider } from '@/shared/lib/localization/i18n.context';
import { LangProvider } from '@/shared/lib/localization/lang.context';
import { DialogProvider } from '@/shared/ui/components/dialog';
import { pretendardVariable } from '@/shared/ui/foundation/fonts';
import PartyroomConnectionProvider from './_providers/partyroom-connection.provider';
import ReactQueryProvider from './_providers/react-query.provider';

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
          <LangProvider lang={lang as Language}>
            <I18nProvider dictionary={dictionary}>
              <DialogProvider>
                <MeHydration>
                  <StoresProvider>
                    <PartyroomConnectionProvider>{children}</PartyroomConnectionProvider>
                  </StoresProvider>
                </MeHydration>
              </DialogProvider>
            </I18nProvider>
          </LangProvider>
        </ReactQueryProvider>

        <div id={DomId.DrawerRoot} />
        <div id={DomId.TooltipRoot} />
      </body>
    </html>
  );
};

export default RootLayout;
