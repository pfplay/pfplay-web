import { redirect } from 'next/navigation';
import { PropsWithChildren } from 'react';
import Header from '@/components/layouts/header.component';
import { WalletProvider } from '@/context/wallet.provider';
import { getServerAuthSession } from '@/utils/next-auth-options';

const SettingsLayout = async ({ children }: PropsWithChildren) => {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/');
  }
  return (
    <WalletProvider>
      <Header />
      <main className='pt-app pb-app'>{children}</main>
    </WalletProvider>
  );
};

export default SettingsLayout;
