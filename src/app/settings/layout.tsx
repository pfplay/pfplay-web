import Header from '@/components/layouts/Header';

const ProfileEditLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <>
      <Header />
      <main className='min-w-laptop  py-[160px] pb-[120px] bg-black'>{children}</main>
    </>
  );
};

export default ProfileEditLayout;
