import { PropsWithChildren } from 'react';

const PartyRoomLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <main className='bg-partyRoom'>{children}</main>
    </>
  );
};

export default PartyRoomLayout;
