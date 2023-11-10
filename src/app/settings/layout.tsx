import { PropsWithChildren } from 'react';
import Header from '@/components/layouts/Header';

const ProfileEditLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Header />
      <main className='min-w-laptop py-[160px] pb-[120px]'>{children}</main>
    </>
  );
};

export default ProfileEditLayout;
