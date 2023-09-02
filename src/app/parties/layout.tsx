import PartiesSideBar from '@/components/@features/Parties/PartiesSideBar';

const PartiesLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <main className='bg-partyRoom py-40 '>
      <PartiesSideBar />
      {children}
    </main>
  );
};

export default PartiesLayout;
