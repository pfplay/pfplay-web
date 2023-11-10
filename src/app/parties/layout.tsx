import { PropsWithChildren } from 'react';
import Header from '@/components/layouts/Header';

const PartiesLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Header />
      <main className='px-app pt-app overflow-y-auto'>{children}</main>
    </>
  );
};

export default PartiesLayout;
