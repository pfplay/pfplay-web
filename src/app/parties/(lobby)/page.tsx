import { Suspense } from 'react';
import CreatePartyRoomCard from '@/components/features/Parties/CreatePartyRoomCard';
import PartiesContainer from '@/components/features/Parties/PartiesContainer';
import PartiesMainStageCard from '@/components/features/Parties/PartiesMainStageCard';
import PartyRoomList from '@/components/features/Parties/PartyRoomList';
import Typography from '@/components/shared/atoms/Typography';
import { cn } from '@/utils/cn';

const PartyLobbyPage = async () => {
  return (
    <PartiesContainer>
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
          <Suspense
            fallback={
              // TODO: 로딩 skeleton 나오면 수정
              <div className='flexRow justify-center items-center p-20'>
                <Typography type='detail1'>로딩중...</Typography>
              </div>
            }
          >
            <PartyRoomList />
          </Suspense>
        </section>
      </div>
    </PartiesContainer>
  );
};

export default PartyLobbyPage;
