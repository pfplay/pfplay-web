import { Tabs } from '@mantine/core';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';

import { BackButtonItem } from '@/components/ui/BackButtonItem';
import { routes } from '@/config/routes';

const AvatarEditPage: NextPage = () => {
  const router = useRouter();
  return (
    <>
      {/* <RootLayout> */}
      <div className='pt-40 flex justify-center text-white px-[120px]'>
        <div className='w-full bg-[#111111] px-[60px] pb-12 pt-[46px]'>
          <div onClick={() => router.back()}>
            <BackButtonItem title='뭘 입고 놀아볼까요?' />
          </div>
          <div className='flex gap-[30px]'>
            {/* 아바타 미리보기 */}
            <div className='bg-[#000] min-w-[400px] h-[620px]'>avatar preview</div>
            {/* 아이템 설정 */}
            <div className='flex-col w-full'>
              <Tabs
                defaultValue='BODY'
                styles={() => ({
                  tab: {
                    color: '#545454',
                    paddingTop: '12px',
                    paddingBottom: '16px',
                    borderWidth: '1px',
                    '&[data-active]': {
                      borderWidth: '3px',
                      borderColor: '#B41024',
                      color: '#B41024',
                      '&:hover': {
                        borderColor: '#B41024',
                      },
                    },
                    '&:hover': {
                      background: 'transparent',
                      borderColor: 'transparent',
                    },
                  },
                  tabLabel: {
                    display: 'flex',
                    alignItems: 'center',
                  },
                  tabsList: {
                    borderBottom: '1px solid #434343',
                  },
                })}
              >
                {/* 탭 리스트 */}
                <Tabs.List>
                  <Tabs.Tab value={'BODY'}>
                    <p className='text-xl font-bold'>Body</p>
                  </Tabs.Tab>
                  <Tabs.Tab value={'FACE'}>
                    <p className='text-xl font-bold'>Face</p>
                  </Tabs.Tab>
                </Tabs.List>
                <div className='max-h-[480px] whitespace-nowrap overflow-auto scrollbar-hide'>
                  {/* BODY */}
                  <Tabs.Panel value={'BODY'}>
                    <div className='flex gap-5 flex-wrap h-[480px] overflow-auto mb-4 mt-7 scrollbar-hide'>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((value) => (
                        <div key={value} className='w-[200px] h-[200px] bg-[#1A1A1A]'>
                          body
                        </div>
                      ))}
                    </div>
                  </Tabs.Panel>
                  {/* FACE */}
                  <Tabs.Panel value={'FACE'}>
                    {/* NFT 목록 */}
                    <div className='mt-5 mb-[17px] flex justify-between items-center'>
                      <div className='flex items-center'>
                        <p className='text-[28px]'>NFT</p>
                        <p className='text-4 text-grey-3 ml-4'>연결된 지갑</p>
                        <p className='text-4 text-red-2'>1</p>
                      </div>
                      {/* <div className="flex justify-end"></div> */}
                    </div>
                    <div className='flex gap-5 flex-wrap h-[480px] overflow-auto mb-4 scrollbar-hide'>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((value) => (
                        <div key={value} className='w-[200px] h-[200px] bg-[#1A1A1A]'>
                          nft
                        </div>
                      ))}
                    </div>
                    {/* FACE 목록 */}
                    <div className='text-[28px]'>PFPPlay</div>
                    <div className='flex gap-5 flex-wrap h-[480px] mt-7 overflow-auto mb-4 scrollbar-hide'>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((value) => (
                        <div key={value} className='w-[200px] h-[200px] bg-[#1A1A1A]'>
                          face
                        </div>
                      ))}
                    </div>
                  </Tabs.Panel>
                </div>
                <div className='flex justify-end align-bottom mt-5'>
                  <button
                    className='w-[280px] py-3 px-4 bg-redGradientStart text-white rounded-sm'
                    onClick={() => router.push(routes.parties.base)}
                  >
                    Let&apos;s get in
                  </button>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      {/* </RootLayout> */}
    </>
  );
};

export default AvatarEditPage;
