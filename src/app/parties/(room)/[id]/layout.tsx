import { PropsWithChildren } from 'react';

const PartyRoomLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <main>{children}</main>
    </>
  );
};

export default PartyRoomLayout;
