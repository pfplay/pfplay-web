import Image from 'next/image';
import { Tab } from '@headlessui/react';
import { cn } from '@/lib/utils';

const tabList: { src: string; alt: string }[] = [
  { src: '/icons/icn_person_outline.svg', alt: '채팅' },
  { src: '/icons/icn_chat_filled.svg', alt: '채팅' },
];

const PartyRoomPage = async () => {
  return (
    <>
      {/* 오른쪽 채팅창 */}
      <aside className='w-[400px] max-h-[90vh] absolute right-0 top-0'>
        <div className='pt-8 pb-3 px-7 bg-black grid grid-cols-2 gap-3'>
          <button className='inline-flex items-center justify-center space-x-2 bg-grey-900 py-2 rounded'>
            <Image src='/icons/icn_info_outline.svg' alt='파티정보' width={20} height={20} />
            <span className='text-grey-300 text-sm'>파티정보</span>
          </button>
          <button className='inline-flex items-center justify-center space-x-2 bg-grey-900 py-2 rounded'>
            <Image src='/icons/icn_party.svg' alt='파티정보' width={20} height={20} />
            <span className='text-grey-300 text-sm'>파티목록</span>
          </button>
        </div>
        {/* 채팅, 사람 탭 */}
        <div className='px-7 bg-black'>
          <Tab.Group>
            <Tab.List className={cn('w-full flex space-x-1 rounded-xl p-1')}>
              {tabList.map((value) => (
                <Tab
                  key={value.src}
                  className={({ selected }) =>
                    cn(
                      'w-full flexRowCenter  pt-3 pb-4 border-b-[1px] text-sm font-medium leading-5  bg-transparent outline-none',
                      selected
                        ? 'text-white shadow border-red-400'
                        : 'text-grey-500 border-grey-500 '
                    )
                  }
                >
                  {() => (
                    <>
                      {/* TODO: selected prop에 따라 svg fill/outline 바꿔주기  or 모든  svg를 component화 시켜서 조건에 따라 prop(e.g. fill, stroke) passing하기*/}
                      <Image src={value.src} alt='채팅' width={20} height={20} />
                      <span className='inline-block ml-1.5 font-medium leading-relaxed'>채팅</span>
                    </>
                  )}
                </Tab>
              ))}
            </Tab.List>
          </Tab.Group>
        </div>
        {/* 채팅창 목록 */}
        <div className='relative w-full bg-gradient-to-r from-black/0 via-black/80 to-black/80'>
          <div className='absolute top-0 left-0 w-full h-6 bg-gradient-to-b from-black to-black/0 z-50'>
            <div className='flex flex-col-reverse space-y-4 ml-7 mr-10 overflow-y-scroll'>
              {/* user #1 */}
              <div className='flex gap-x-2'>
                <div className='w-8 h-8 bg-white rounded-full'></div>
                <div className='flex flex-col gap-y-0.5'>
                  <span className='text-sm text-white'>FENDI</span>
                  <p className='text-white p-2 bg-grey-900 rounded-sm text-sm'>
                    skdjfsldjfldsjfdlf
                  </p>
                </div>
              </div>
            </div>
            <div className='ml-7 mr-10 mb-10 mt-6 border border-grey-600 p-3 flex items-center gap-x-2'>
              <input
                type='text'
                className='block w-full bg-transparent text-white text-sm'
                placeholder='무슨 얘기를 해볼까요?'
              />
              <button className='inline-flex items-center justify-center py-1 px-3 bg-grey-800 rounded-sm'>
                <Image src='/icons/icn_send.svg' alt='send' width={20} height={20} />
              </button>
            </div>
          </div>
        </div>
      </aside>
      {/* 가운데 플레이리스트 */}
      <section className='w-[512px] flex flex-col items-center justify-center mx-auto'>
        <div className='mt-11 bg-black px-3 py-2.5 flex items-center w-full border-2 border-grey-800 rounded'>
          <Image src='/icons/icn_campaign.svg' alt='campaign' width={20} height={20} />
          <p className='text-white text-xs ml-3'>
            회원간 비방 및 친목을 금지합니다. 어길 시 바로 강퇴
          </p>
        </div>
        <div className='my-2 w-full h-[288px] bg-black border border-grey-800 rounded'></div>
        <div className='p-5 bg-black w-full flex justify-between border-2 border-grey-800 rounded relative'>
          <p className='text-white font-bold'>
            NewJeans &#40;뉴진스&#41; &#39;Hype Boy&#39; Official MV &#40;Performance ver.1&#41;
          </p>
          <div className='absolute top-1.5 right-1.5 flex items-center gap-x-1 bg-black'>
            <div className='bg-grey-800 w-12 py-1 rounded flex items-center justify-center flex-col'>
              <Image src='/icons/icn_thumb_up.svg' alt='campaign' width={18} height={18} />
              <p className='text-white font-bold mt-1'>17</p>
            </div>
            <div className='bg-grey-800 w-12 py-1 rounded flex items-center justify-center flex-col'>
              <Image src='/icons/icn_add_playlist.svg' alt='campaign' width={18} height={18} />
              <p className='text-white font-bold mt-1'>5</p>
            </div>
            <div className='bg-grey-800 w-12 py-1 rounded flex items-center justify-center flex-col'>
              <Image src='/icons/icn_thumb_down.svg' alt='campaign' width={18} height={18} />
              <p className='text-white font-bold mt-1'>3</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PartyRoomPage;
