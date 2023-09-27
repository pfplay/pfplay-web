import React from 'react';
import Header from '@/components/@features/Home/Header';

const ProfileEditLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <>
      <Header />
      <main className='min-w-laptop  py-[160px] pb-[120px] bg-black'>{children}</main>
    </>
  );
};

export default ProfileEditLayout;
