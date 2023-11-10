'use server';
import { Suspense } from 'react';
import CreatePartyRoomCard from '@/components/features/Parties/CreatePartyRoomCard';
import PartiesContainer from '@/components/features/Parties/PartiesContainer';
import PartiesMainStageCard from '@/components/features/Parties/PartiesMainStageCard';
import PartyRoomList from '@/components/features/Parties/PartyRoomList';
import Typography from '@/components/shared/atoms/Typography';

const PartiesPage = async () => {
  return (
    <PartiesContainer>
      <div className='max-w-desktop mx-auto'>
        <PartiesMainStageCard />
        <section className='grid grid-cols-3 gap-6 mt-6 overflow-y-auto'>
          <CreatePartyRoomCard />
          <Suspense
            fallback={
              // TODO: 로딩 skeleon 나오면 수정
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

export default PartiesPage;
