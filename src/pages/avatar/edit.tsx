import { Tabs } from '@mantine/core'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import axios from 'axios'
import type { NextPage } from 'next'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

import { BackButtonItem } from '@/components/ui/BackButtonItem'
import RootLayout from '@/components/ui/layout/RootLayout'

const AvatarEditPage: NextPage = () => {
  const { address } = useAccount()
  const walletAddress = address

  const [list, setList] = useState<string[]>([])

  useEffect(() => {
    const baseURL = 'https://eth-mainnet.g.alchemy.com/v2/ypoWB89fktlLXGG5FCYGEa_Sk_GIsYvL'
    // const url = `${baseURL}/getNFTs/?owner=${walletAddress}`
    const url = `${baseURL}/getNFTs/?owner=${'0xa4d1D0060eAd119cdF04b7C797A061400C6Ba8a7'}`

    if (walletAddress === undefined) {
      return
    }
    const config = {
      method: 'get',
      url: url,
    }
    const address: string[] = []
    const loadNft = async () => {
      const response: Test = await (await axios(config)).data
      for (const element of response.ownedNfts) {
        // console.log(element.media)
        for (const de of element.media) {
          if (de.format === 'png') {
            address.push(de.gateway)
          }
        }
      }
      // console.log(address)
      setList(address)
      // setList(response.ownedNfts)
      // console.log(response)
    }
    loadNft()
  }, [])

  // console.log(list)

  return (
    <>
      <RootLayout>
        <div className="pt-40 flex justify-center text-white px-[120px]">
          <div className="w-full bg-[#111111] px-[60px] pb-12 pt-[46px]">
            <BackButtonItem title="뭘 입고 놀아볼까요?" />
            <div className="flex gap-[30px]">
              {/* 아바타 미리보기 */}
              <div className="bg-[#000] min-w-[400px] h-[620px]">avatar preview</div>
              {/* 아이템 설정 */}
              <div className="flex-col w-full">
                <Tabs
                  defaultValue="BODY"
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
                  <div className="max-h-[480px] whitespace-nowrap overflow-auto scrollbar-hide">
                    {/* BODY */}
                    <Tabs.Panel value={'BODY'}>
                      <div className="flex gap-5 flex-wrap h-[480px] overflow-auto mb-4 mt-7 scrollbar-hide">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(value => (
                          <div key={value} className="w-[200px] h-[200px] bg-[#1A1A1A]">
                            body
                          </div>
                        ))}
                      </div>
                    </Tabs.Panel>
                    {/* FACE */}
                    <Tabs.Panel value={'FACE'}>
                      {/* NFT 목록 */}
                      <div className="mt-5 mb-[17px] flex justify-between items-center">
                        <div className="flex items-center">
                          <p className="text-[28px]">NFT</p>
                          <p className="text-4 text-gray700 ml-4">연결된 지갑</p>
                          <p className="text-4 text-red700">1</p>
                        </div>
                        <ConnectButton label="지갑 연결" />
                      </div>
                      <div className="flex gap-5 flex-wrap h-[480px] overflow-auto mb-4 scrollbar-hide">
                        {list.map((d: any, i) => (
                          <div key={i} className="w-[200px] h-[200px] aspect-square object-cover">
                            <>
                              <Image
                                width={200}
                                height={200}
                                // src={d.media[0].gateway}
                                src={d}
                                alt={'NFT'}
                              />
                            </>
                          </div>
                        ))}
                      </div>
                      {/* FACE 목록 */}
                      <div className="text-[28px]">PFPPlay</div>
                      <div className="flex gap-5 flex-wrap h-[480px] mt-7 overflow-auto mb-4 scrollbar-hide">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(value => (
                          <div key={value} className="w-[200px] h-[200px] bg-[#1A1A1A]">
                            face
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
      </RootLayout>
    </>
  )
}
export default AvatarEditPage

type Test = {
  ownedNfts: [
    {
      media: [
        {
          format: string
          raw: string
          gateway: string
        },
      ]
    },
  ]
}
