import { redirect } from 'next/navigation';
import { PropsWithChildren } from 'react';
import Header from '@/components/layouts/Header';
import WalletProvider from '@/context/WalletProvider';
import { getServerAuthSession } from '@/utils/authOptions';

const ProfileEditLayout = async ({ children }: PropsWithChildren) => {
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

export default ProfileEditLayout;
