import { PropsWithChildren } from 'react';
import Header from '@/components/layouts/Header';
import { WalletProvider } from '@/context/WalletProvider';

const ProfileEditLayout = ({ children }: PropsWithChildren) => {
  return (
    <WalletProvider>
      <Header />
      <main className='pt-app pb-app'>{children}</main>
    </WalletProvider>
  );
};

export default ProfileEditLayout;
