'use client';
import Image from 'next/image';
import { useState } from 'react';
import CreatePartyModalBody from '@/components/@features/Parties/CreatePartyModalBody';
import MyPlaylist from '@/components/@features/Parties/MyPlaylist';
import PartiesMainStageCard from '@/components/@features/Parties/PartiesMainStageCard';
import PartiesSideBar from '@/components/@features/Parties/PartiesSideBar';
import PartyRoomCard from '@/components/@features/Parties/PartyRoomCard';
import Typography from '@/components/@shared/@atoms/Typography';
import { mockPlayListItemConfig } from '@/constants/__mock__/mockPlayListItemConfig';
import { useDialog } from '@/hooks/useDialog';

const PartiesPage = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { openDialog } = useDialog();

  const handleClickBeAHostBtn = () => {
    return openDialog(() => ({
      title: '파티 개설',
      titleAlign: 'left',

      showCloseIcon: true,
      classNames: {
        container: 'w-[800px]',
      },
      Body: () => <CreatePartyModalBody />,
    }));
  };
  return (
    <>
      <PartiesSideBar setDrawerOpen={setDrawerOpen} />
      <div className='max-w-desktop mx-auto'>
        <PartiesMainStageCard />
        {/* FIXME: set height of the partyRoom list section */}
        <section className='grid grid-cols-3 gap-6 mt-6 overflow-y-auto'>
          <article
            onClick={() => handleClickBeAHostBtn()}
            className='gap-10 pt-6 bg-gray-900 rounded cursor-pointer flexCol px-7 z-0'
          >
            <div className='items-start gap-3 flexCol'>
              <Typography type='title2' className='text-red-300'>
                Be a PFPlay Host
              </Typography>
              <Typography type='detail1' className='text-gray-200'>
                원하는 테마의 파티를 자유롭게 호스트해보세요!
              </Typography>
            </div>
            <div className='flex items-center justify-center'>
              <Image src='/image/bigPlus.png' alt='Party Room Add' width={60} height={60} />
            </div>
          </article>
          {mockPlayListItemConfig.map((config) => (
            <PartyRoomCard key={config.id} roomId={config.id} playListItemConfig={config} />
          ))}
        </section>
      </div>
      <MyPlaylist {...{ drawerOpen, setDrawerOpen }} />
    </>
  );
};

export default PartiesPage;
