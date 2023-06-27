import { PartiesSideBar } from '@/components/_features/parties/parties-side-bar';

export default function PartiesLayout({ children }: React.PropsWithChildren) {
  return (
    <main className='bg-partyRoom py-40'>
      <PartiesSideBar />
      {children}
    </main>
  );
}

