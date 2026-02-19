import { PartyroomCreateCard } from '@/features/partyroom/create';
import { MainPartyroomCard, PartyroomList } from '@/features/partyroom/list';
import SuspenseWithErrorBoundary from '@/shared/api/http/error/suspense-with-error-boundary.component';
import { cn } from '@/shared/lib/functions/cn';

interface PanelMainProps {
  onClose?: () => void;
}

export default function PanelMain({ onClose }: PanelMainProps) {
  return (
    <div className='flex-1 pr-3 max-h-[690px] h-[50vh] overflow-y-scroll'>
      <SuspenseWithErrorBoundary enableReload>
        <MainPartyroomCard onClose={onClose} />
      </SuspenseWithErrorBoundary>

      <section
        className={cn([
          'grid gap-[1.5rem] mt-6 overflow-y-auto',
          'grid-rows-[240px] auto-rows-[240px] grid-flow-row-dense',
          'grid-cols-1',
          'desktop:grid-cols-[repeat(auto-fit,calc((100%-1.5rem)/2))]',
          'mb-14',
        ])}
      >
        <div className='h-full flexCol border border-gray-800 rounded cursor-pointer'>
          <PartyroomCreateCard />
        </div>
        <PartyroomList onClose={onClose} />
      </section>
    </div>
  );
}
