import SideBar from '@/components/ui/SideBar';

const SidebarLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <SideBar />
      <main className='w-[100vw] h-[100vh] bg-onboarding bg-cover'>{children}</main>
    </div>
  );
};

export default SidebarLayout;
