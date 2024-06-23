import { PropsWithChildren } from 'react';
import Header from '@/shared/ui/layouts/header.component';
import { WalletProvider } from '../_providers/wallet.provider';

const SettingsLayout = ({ children }: PropsWithChildren) => {
  return (
    <WalletProvider>
      <Header />
      <main className='pt-app pb-app'>{children}</main>
    </WalletProvider>
  );
};

export default SettingsLayout;
