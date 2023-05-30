import { Tabs } from '@mantine/core'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import type { NextPage } from 'next'

import { BackButtonItem } from '@/components/ui/BackButtonItem'
import RootLayout from '@/components/ui/layout/RootLayout'

const AvatarEditPage: NextPage = () => {
  return (
    <RootLayout>
      {/* 아바타 설정 컨테이너 */}
      <div className="pt-40 flex justify-center text-white px-[120px]">
        <div className="w-full bg-[#111111] px-[60px] pb-12 pt-[46px]">
          <BackButtonItem title="뭘 입고 놀아볼까요?" />
          <div className="flex justify-between">
            {/* 아바타 미리보기 */}
            <div className="bg-[#2c2c2c] min-w-[400px] mr-[60px] h-[620px]">avatar preview</div>
            {/* 아이템 설정 */}
            <div className="w-full flex">
              <div className="w-full">
                <Tabs
                  defaultValue="BODY"
                  styles={() => ({
                    tab: {
                      color: '#545454',
                      paddingTop: '12px',
                      paddingBottom: '16px',
                      borderWidth: '1px',
                      '&[data-active]': {
                        borderWidth: '2px',
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
                  })}>
                  {/* 탭 리스트 */}
                  <Tabs.List>
                    <Tabs.Tab value={'BODY'}>
                      <p className="text-xl font-bold">Body</p>
                    </Tabs.Tab>
                    <Tabs.Tab value={'FACE'}>
                      <p className="text-xl font-bold">Face</p>
                    </Tabs.Tab>
                  </Tabs.List>
                  {/* 탭 패널 */}
                  <div className="max-h-[480px] whitespace-nowrap overflow-auto scrollbar-hide">
                    {/* 바디 */}
                    <Tabs.Panel value={'BODY'}>
                      <div className="grid grid-cols-5 gap-5  mt-7">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(value => (
                          <div key={value} className="aspect-square bg-[#5f5f5f]">
                            body
                          </div>
                        ))}
                      </div>
                    </Tabs.Panel>
                    {/* 페이스*/}
                    <Tabs.Panel value={'FACE'}>
                      {/* NFT */}
                      <div className="mt-5 mb-[17px] flex justify-between items-center">
                        <div className="flex items-center">
                          <p className="text-[28px]">NFT</p>
                          <p className="text-4 text-gray700 ml-4">연결된 지갑</p>
                          <p className="text-4 text-red700">1</p>
                        </div>
                        <div className="flex justify-end">
                          {/* FIXME : 디자인 수정 필요*/}
                          {/* <button className="w-[138px] h-9 flex items-center border border-[#434343] rounded justify-center">
                            <Image
                              src="/icons/Ethereum.svg"
                              alt="ethereum"
                              width={18}
                              height={18}
                            />
                            <p className="text-[14px] ml-1">0xC6...880D</p>
                          </button> */}
                          <ConnectButton />
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-5 mb-10">
                        {[1, 2, 3].map(value => (
                          <div key={value} className="aspect-square bg-[#5f5f5f]">
                            NFT
                          </div>
                        ))}
                      </div>
                      {/* 기본 face */}
                      <div className="text-[28px]">PFPPlay</div>
                      <div className="grid grid-cols-5 gap-5 mt-7">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(value => (
                          <div key={value} className="aspect-square bg-[#5f5f5f]">
                            Face
                          </div>
                        ))}
                      </div>
                    </Tabs.Panel>
                  </div>
                  <div className="flex justify-end align-bottom mt-5">
                    <button className="w-[280px] py-3 px-4 bg-redGradientStart text-white rounded-sm">
                      Let&apos;s get in
                    </button>
                  </div>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  )
}
export default AvatarEditPage
