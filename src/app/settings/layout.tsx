import { PropsWithChildren } from 'react';
import Header from '@/components/layouts/Header';

const ProfileEditLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Header />
      <main className='py-[160px] pb-[120px]'>{children}</main>
    </>
  );
};

export default ProfileEditLayout;
