import { redirect } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { WalletProvider } from '@/context/wallet.provider';
import { getServerAuthSession } from '@/shared/api/next-auth-options';
import Header from '@/shared/ui/layouts/header.component';

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
