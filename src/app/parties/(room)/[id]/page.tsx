import PartiesSideBar from '@/components/features/parties/parties-side-bar';
import { cn } from '@/shared/lib/functions/cn';
import Button from '@/shared/ui/components/button/button.component';
import {
  PFInfoOutline,
  PFCampaign,
  PFSend,
  PFThumbDownAlt,
  PFThumbUpAlt,
  PFAddPlaylist,
  PFParty,
} from '@/shared/ui/icons';

const PartyRoomPage = async () => {
  // TODO: 파티룸 모든 api 불러오는 동안 Suspense로 입장 중 페이지 보여주기
  return (
    <>
      {/* 가운데 플레이리스트 */}
      <div className='absolute top-[44px] left-1/2 transform -translate-x-1/2 max-w-full w-[calc(512px+(40px*2))] px-[40px]'>
        <div className='flexColCenter'>
          <div className='mt-11 bg-black px-3 py-2.5 flex items-center w-full border-2 border-gray-800 rounded'>
            <PFCampaign width={20} height={20} />
            <p className='text-white text-xs ml-3'>
              회원간 비방 및 친목을 금지합니다. 어길 시 바로 강퇴
            </p>
          </div>
          <div className='my-2 w-full h-[288px] bg-black border border-gray-800 rounded'></div>
          <div className='p-5 bg-black w-full flex justify-between border-2 border-gray-800 rounded relative'>
            <p className='text-white font-bold'>
              NewJeans &#40;뉴진스&#41; &#39;Hype Boy&#39; Official MV &#40;Performance ver.1&#41;
            </p>
            <div className='absolute top-1.5 right-1.5 flex items-center gap-x-1 bg-black'>
              <div className='bg-gray-800 w-12 py-1 rounded flex items-center justify-center flex-col'>
                <PFThumbUpAlt width={18} height={18} />
                <p className='text-white font-bold mt-1'>17</p>
              </div>
              <div className='bg-gray-800 w-12 py-1 rounded flex items-center justify-center flex-col'>
                <PFAddPlaylist width={18} height={18} />
                <p className='text-white font-bold mt-1'>5</p>
              </div>
              <div className='bg-gray-800 w-12 py-1 rounded flex items-center justify-center flex-col'>
                <PFThumbDownAlt width={18} height={18} />
                <p className='text-white font-bold mt-1'>3</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 왼쪽 float 메뉴 */}
      <PartiesSideBar
        className={cn([
          'flexCol justify-between gap-10 px-1 py-6 bg-[#0E0E0E] rounded',
          'absolute top-1/2 left-[40px] transform -translate-y-1/2',
        ])}
        showDJQueue
      />

      {/* 오른쪽 채팅창 */}
      <div className='absolute top-0 right-0 w-[400px] max-w-full h-screen bg-black pt-8 pb-3 px-7'>
        <div className='bg-black grid grid-cols-2 gap-3'>
          <Button
            color='secondary'
            variant='outline'
            Icon={<PFInfoOutline width={20} height={20} className='[&_*]:stroke-white' />}
            size='sm'
            className='text-gray-50'
          >
            파티정보
          </Button>
          <Button
            color='secondary'
            variant='outline'
            Icon={<PFParty widths={20} height={20} className='[&_*]:fill-gray-300' />}
            size='sm'
            className='text-gray-50'
          >
            파티목록
          </Button>
        </div>

        {/* 채팅, 사람 탭 */}
        <div className='px-7 bg-black'></div>

        {/* 채팅창 목록 */}
        <div className='flex-1 w-full bg-gradient-to-r from-black/0 via-black/80 to-black/80 mt-6'>
          <div className='w-full h-6 bg-gradient-to-b from-black to-black/0'>
            <div className='flex flex-col-reverse space-y-4 overflow-y-auto'>
              {/* user #1 */}
              <div className='flex gap-x-2'>
                <div className='w-8 h-8 bg-white rounded-full'></div>
                <div className='flex flex-col gap-y-0.5'>
                  <span className='text-sm text-white'>FENDI</span>
                  <p className='text-white p-2 bg-gray-900 rounded-sm text-sm'>
                    skdjfsldjfldsjfdlf
                  </p>
                </div>
              </div>
            </div>
            <div className='border border-gray-600 p-3 flex items-center gap-x-2 mt-6'>
              <input
                type='text'
                className='block w-full bg-transparent text-white text-sm'
                placeholder='무슨 얘기를 해볼까요?'
              />
              <button className='inline-flex items-center justify-center py-1 px-3 bg-gray-800 rounded-sm'>
                <PFSend width={20} height={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PartyRoomPage;
