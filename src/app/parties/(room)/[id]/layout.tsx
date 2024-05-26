import { PropsWithChildren } from 'react';

const PartyroomLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <main className='bg-partyRoom'>{children}</main>
    </>
  );
};

export default PartyroomLayout;
