import { PropsWithChildren } from 'react';
import Header from '@/shared/ui/layouts/header.component';

const PartyLobbyLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Header />
      <main className='px-app pt-app pb-app overflow-y-auto'>{children}</main>
    </>
  );
};

export default PartyLobbyLayout;
