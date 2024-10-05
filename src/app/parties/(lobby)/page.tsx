import { PartyroomCreateCard } from '@/features/partyroom/create';
import { MainPartyroomCard, PartyroomList } from '@/features/partyroom/list';
import SuspenseWithErrorBoundary from '@/shared/api/suspense-with-error-boundary.component';
import { cn } from '@/shared/lib/functions/cn';
import { Sidebar } from '@/widgets/sidebar';

const PartyLobbyPage = () => {
  return (
    <>
      <Sidebar
        className={cn([
          'flexCol justify-between gap-10 px-1 py-6 bg-[#0E0E0E] rounded',
          'fixed z-10 bottom-8 right-8 transform',
          'laptop:bottom-[unset] laptop:right-[unset] laptop:top-1/2 laptop:left-8 laptop:-translate-y-1/2',
        ])}
      />

      <div className='max-w-desktop mx-auto'>
        <SuspenseWithErrorBoundary enableReload>
          <MainPartyroomCard />
        </SuspenseWithErrorBoundary>

        <section
          className={cn([
            'grid gap-[1.5rem] mt-6 overflow-y-auto',
            'grid-rows-[240px] auto-rows-[240px] grid-flow-row-dense',
            'grid-cols-1',
            'tablet:grid-cols-[repeat(auto-fit,calc((100%-1.5rem)/2))]', // 100%-{COL_GAP}
            'desktop:grid-cols-[repeat(auto-fit,calc((100%-3rem)/3))]', // 100%-({COL_GAP}*2)
          ])}
        >
          <PartyroomCreateCard />

          <PartyroomList />
        </section>
      </div>
    </>
  );
};

export default PartyLobbyPage;
