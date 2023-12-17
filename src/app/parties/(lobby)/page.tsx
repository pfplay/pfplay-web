import CreatePartyRoomCard from '@/components/features/Parties/CreatePartyRoomCard';
import PartiesMainStageCard from '@/components/features/Parties/PartiesMainStageCard';
import PartiesSideBar from '@/components/features/Parties/PartiesSideBar';
import PartyRoomList from '@/components/features/Parties/PartyRoomList';
import SuspenseWithErrorBoundary from '@/components/shared/SuspenseWithErrorBoundary';
import { cn } from '@/utils/cn';

const PartyLobbyPage = async () => {
  return (
    <>
      <PartiesSideBar
        className={cn([
          'flexCol justify-between gap-10 px-1 py-6 bg-[#0E0E0E] rounded',
          'fixed z-10 bottom-8 right-8 transform',
          'laptop:bottom-[unset] laptop:right-[unset] laptop:top-1/2 laptop:left-8 laptop:-translate-y-1/2',
        ])}
      />

      <div className='max-w-desktop mx-auto'>
        <PartiesMainStageCard />
        <section
          className={cn([
            'grid gap-[1.5rem] mt-6 overflow-y-auto',
            'grid-rows-[repeat(auto-fit,240px)]',
            'grid-cols-1',
            'tablet:grid-cols-[repeat(auto-fit,minmax(calc((100%-1.5rem)/2),1fr))]', // 100%-{COL_GAP}
            'desktop:grid-cols-[repeat(auto-fit,minmax(calc((100%-3rem)/3),1fr))]', // 100%-({COL_GAP}*2)
          ])}
        >
          <CreatePartyRoomCard />

          <SuspenseWithErrorBoundary enableReload>
            <PartyRoomList />
          </SuspenseWithErrorBoundary>
        </section>
      </div>
    </>
  );
};

export default PartyLobbyPage;
