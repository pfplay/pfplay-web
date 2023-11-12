import { PropsWithChildren } from 'react';
import Header from '@/components/layouts/Header';

const ProfileEditLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Header />
      <main className='pt-app pb-app'>{children}</main>
    </>
  );
};

export default ProfileEditLayout;
