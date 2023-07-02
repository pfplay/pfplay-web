'use client';
import Image from 'next/image';
import React, { useState } from 'react';
import { PartiesMainStageCard } from './parties-main-stage-card';
import { PartyRoomCard } from './party-room-card';
import { CreatePartyModal } from './create-party-modal';

export const PartiesMain = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    // TODO:  breakpoints 정한 후 반응형 적용
    <>
      <section className='desktop:w-[1248px] laptop:px-[140px] mx-auto'>
        <PartiesMainStageCard />
        {/* 파티룸 목록 */}
        <ul className='grid mt-6 grid-cols-3 gap-6'>
          <li
            className='flexCol gap-4 bg-[#111] rounded pt-6 px-7  cursor-pointer'
            onClick={() => setIsOpen(true)}
          >
            <div>
              <p className='font-poppins text-[#F31F2C] text-[28px] mb-1.5'>Be a PFPlay Host</p>
              <span className='text-[#DADADA]'>원하는 테마의 파티를 자유롭게 호스트해보세요!</span>
            </div>
            <div className='flex items-center justify-center'>
              <Image src='/icons/icn_add.svg' alt='add' width={60} height={60} />
            </div>
          </li>
          {[1, 2, 3, 4].map((value) => (
            <PartyRoomCard key={value} value={value} />
          ))}
        </ul>
      </section>
      <CreatePartyModal isOpen={isOpen} onModalClose={() => setIsOpen(false)} />
    </>
  );
};

