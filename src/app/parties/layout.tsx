import { PartiesSideBar } from '@/components/_features/parties/parties-side-bar';

const PartiesLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <main className='bg-partyRoom py-40 '>
      <PartiesSideBar />
      {children}
    </main>
  );
};

export default PartiesLayout;
