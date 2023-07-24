'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';
import { routes } from '@/config/routes';

const PartiesMainStageCard = () => {
  const router = useRouter();

  return (
    <div className='w-full py-10 px-7 border border-[#1c1c1c] rounded backdrop-blur-lg bg-[#180202]/30'>
      <h2
        className='text-white font-poppins text-[28px] mb-1.5 cursor-pointer no-underline hover:underline'
        onClick={() => router.push(`${routes.parties.base}/1`)} // TODO: set proper route for main stage
      >
        PFPlay Main Stage
      </h2>
      <p className='text-[#dadada] font-light'>파티에 오신 것을 환영합니다</p>
      <div className='w-full flex justify-start items-center gap-36 mt-[28px]'>
        <div className='flexRow gap-11'>
          <div className='flex  gap-x-1.5'>
            <Image src='/icons/icn_person_outline.svg' alt='채팅' width={20} height={20} />
            <p className='text-[#dadada]'>48</p>
          </div>
          <ul className='flex items-center gap-x-2'>
            {[1, 2, 3].map((value) => (
              <li key={value} className='w-6 h-6 rounded-full bg-slate-400'></li>
            ))}
          </ul>
        </div>
        <div className='w-full flex items-center pt-4 gap-x-3 border-t border-[#2f2f2f] '>
          <div className='w-20 h-11 bg-white overflow-hidden rounded'></div>
          <p className='text-[#dadada] text-sm'>
            NewJeans (뉴진스) &#39;Attention&#39; Official MV
          </p>
        </div>
      </div>
    </div>
  );
};

export default PartiesMainStageCard;
