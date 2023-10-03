'use client';
import { useRouter } from 'next/navigation';

import { PFPersonOutline } from '@/components/@shared/@icons';
import { ROUTES } from '@/utils/routes';
import { replaceDynamic } from '@/utils/routes/replaceDynamic';

const PartiesMainStageCard = () => {
  const router = useRouter();

  return (
    <div
      className='w-full py-10 px-7 border border-gray-800 rounded backdrop-blur-lg bg-[#180202]/30'
      /* FIXME: bg 에 쓰인 [#180202]/30 는 디자인 시스템에 없는 hex */
    >
      <h2
        className='text-white font-poppins text-[28px] mb-1.5 cursor-pointer no-underline hover:underline'
        onClick={() =>
          router.push(
            replaceDynamic(ROUTES.PARTIES.room, {
              id: 1, // TODO: set proper route for main stage
            })
          )
        }
      >
        PFPlay Main Stage
      </h2>
      <p className='text-gray-200 font-light'>파티에 오신 것을 환영합니다</p>
      <div className='w-full flex justify-start items-center gap-36 mt-[28px]'>
        <div className='flexRow gap-11'>
          <div className='flex  gap-x-1.5'>
            <PFPersonOutline width={20} height={20} />
            <p className='text-gray-200'>48</p>
          </div>
          <ul className='flex items-center gap-x-2'>
            {[1, 2, 3].map((value) => (
              <li key={value} className='w-6 h-6 rounded-full bg-slate-400'></li>
            ))}
          </ul>
        </div>
        <div className='w-full flex items-center pt-4 gap-x-3 border-t border-gray-700 '>
          <div className='w-20 h-11 bg-white overflow-hidden rounded'></div>
          <p className='text-gray-200 text-sm'>NewJeans (뉴진스) &#39;Attention&#39; Official MV</p>
        </div>
      </div>
    </div>
  );
};

export default PartiesMainStageCard;
