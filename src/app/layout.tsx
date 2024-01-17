import { Metadata } from 'next';
import '@rainbow-me/rainbowkit/styles.css';
import '@/styles/globals.css';
import { cookies } from 'next/headers';
import { PropsWithChildren } from 'react';
import { ProfileHydration } from '@/components/features/Profile/ProfileHydration';
import { CookieKey } from '@/constants/cookie';
import { DomId } from '@/constants/domId';
import { Language } from '@/constants/lang';
import { DialogProvider } from '@/context/DialogProvider';
import { DictionaryProvider } from '@/context/DictionaryProvider';
import { ReactQueryProvider } from '@/context/ReactQueryProvider';
import SessionProvider from '@/context/SessionProvider';
import { pretendardVariable } from '@/styles/fonts';
import { getServerDictionary } from '@/utils/dictionary';

export const metadata: Metadata = {
  title: 'PFPlay',
  description: 'PFP Playground for music',
  icons: {
    icon: '/favicon.ico',
  },
};

const RootLayout = async ({ children }: PropsWithChildren) => {
  const dictionary = await getServerDictionary();
  const lang = cookies().get(CookieKey.LangCookie)?.value || Language.En;

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
