'use client';
import { useRouter } from 'next/navigation';

import { PFPersonOutline, PFInfoOutline } from '@/components/@shared/@icons';
import { ROUTES } from '@/utils/routes';
import { replaceDynamic } from '@/utils/routes/replaceDynamic';

interface PartyRoomCardProps {
  roomId: number; // TODO: set proper type for value when api is connected
}

const PartyRoomCard = ({ roomId }: PartyRoomCardProps) => {
  // What is the usage of this state?
  // const [isHover, setIsHover] = useState(false);

  const router = useRouter();

  return (
    <li
      onClick={() =>
        router.push(
          replaceDynamic(ROUTES.PARTIES.room, {
            id: roomId, // TODO: set proper route with id
          })
        )
      }
      /* FIXME: bg 에 쓰인 [#180202]/30 는 디자인 시스템에 없는 hex */
      className='py-6 px-7 rounded border border-gray-800 backdrop-blur-lg bg-[#180202]/30 flex flex-col justify-between h-60 relative cursor-pointer'
    >
      <h2 className='text-gray-50 text-2xl cursor-pointer no-underline hover:underline'>
        갓생을 위한 노동요
      </h2>
      <div className='flex flex-col gap-4'>
        <div className='flex items-center gap-x-3'>
          <div className='w-20 h-11 bg-slate-500 rounded'></div>
          <p className='text-gray-200 text-sm'>
            김윤아 2집 - 10. 증오는 나의 힘 &#40;가사포함&#41;
          </p>
        </div>
        <hr className='bg-gray-700' />
        <div className='flex justify-between items-center'>
          <div className='flex items-center gap-x-11'>
            <div className='flex items-center'>
              <PFPersonOutline width={24} height={24} />
              <span className='inline-block ml-1.5 text-gray-200'>48</span>
            </div>
            <ul className='flex items-center gap-x-2'>
              {[1, 2, 3].map((value) => (
                <li key={value} className='w-6 h-6 rounded-full bg-slate-400'></li>
              ))}
            </ul>
          </div>
          <PFInfoOutline width={24} height={24} />
        </div>
      </div>
      {/* TODO:  usecase 확인 후 Refactoring */}
      {/* {isHover && (
        <div className='absolute top-0 left-0 w-full h-full bg-black/90 p-7 pr-10 flex flex-col justify-between'>
          <p className='text-gray-100 whitespace-pre-line'>
            기준
            <br />
            톰보이&#40;&#40;G&#41;I-DLE&#41; 포즈를 하고 싶어지는가 지금 내가 제법 락스타 같아
            보이는가
          </p>
          <div className='flex justify-end'>
            <button className='inline-flex items-center justify-center rounded border border-red-400 py-1.5 px-3 gap-x-2'>
              <span className='text-red-400 text-sm'>입장하기</span>
              <PFChevronRight width={14} height={14} />
            </button>
          </div>
        </div>
      )} */}
    </li>
  );
};

export default PartyRoomCard;
