import { PropsWithChildren } from 'react';
import { Header } from '@/widgets/layouts';
import { WalletProvider } from '../_providers/wallet.provider';

const SettingsLayout = ({ children }: PropsWithChildren) => {
  return (
    <WalletProvider>
      <Header />
      <main>{children}</main>
    </WalletProvider>
  );
};

export default SettingsLayout;
