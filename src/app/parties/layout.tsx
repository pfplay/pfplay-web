import PartiesSideBar from '@/components/@features/Parties/PartiesSideBar';

const PartiesLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <main className='bg-black'>
      <PartiesSideBar />
      {children}
    </main>
  );
};

export default PartiesLayout;
