import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState } from 'react'

import CreatePartyModal from '@/components/modal/PartyModal'
import RootLayout from '@/components/ui/layout/RootLayout'
import SidebarLayout from '@/components/ui/layout/SidebarLayout'

const PartyRoomListPage = () => {
  const [isHover, setIsHover] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const router = useRouter()
  return (
    <RootLayout>
      <div className="w-full h-screen bg-partyRoom relative">
        <SidebarLayout>
          <section className="w-[1248px] mx-auto pt-40">
            <div className="w-full py-10 px-7 border border-[#1c1c1c] rounded backdrop-blur-lg bg-[#180202]/30">
              <h2
                className="text-white font-poppins text-[28px] mb-1.5 cursor-pointer no-underline hover:underline"
                onClick={() => router.push('/party/1')}>
                PFPlay Main Stage
              </h2>
              <p className="text-[#dadada] font-light">파티에 오신 것을 환영합니다</p>
              <div className="mt-[28px] flex justify-between items-end">
                <div className="w-auto flex gap-x-11">
                  <div className="flex items-center gap-x-1.5">
                    <Image src="/icons/icn_person_outline.svg" alt="채팅" width={20} height={20} />
                    <p className="text-[#dadada]">48</p>
                  </div>
                  <ul className="flex items-center gap-x-2">
                    {[1, 2, 3].map(value => (
                      <li key={value} className="w-6 h-6 rounded-full bg-slate-400"></li>
                    ))}
                  </ul>
                </div>
                <div className="w-[768px] border-t border-[#2f2f2f]">
                  <div className="pt-4 flex items-center gap-x-3">
                    <div className="w-20 h-11 bg-white overflow-hidden rounded"></div>
                    <p className="text-[#dadada] text-sm">
                      NewJeans (뉴진스) &#39;Attention&#39; Official MV
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* 파티룸 목록 */}
            <ul className="grid mt-6 grid-cols-3 gap-6">
              <li
                className="bg-[#111] rounded pt-6 px-7 pb-10 cursor-pointer"
                onClick={() => setIsOpen(true)}>
                <p className=" font-poppins text-[#F31F2C] text-[28px] mb-1.5">Be a PFPlay Host</p>
                <span className="text-[#DADADA]">
                  원하는 테마의 파티를 자유롭게 호스트해보세요!
                </span>
                <div className="mt-11 flex items-center justify-center">
                  <Image src="/icons/icn_add.svg" alt="add" width={60} height={60} />
                </div>
              </li>
              {[1, 2, 3, 4].map(value => (
                <li
                  key={value}
                  className="py-6 px-7 rounded border border-[#1C1C1C] backdrop-blur-lg bg-[#180202]/30 flex flex-col justify-between h-60 relative">
                  <h2
                    className="text-[#FDFDFD] text-2xl cursor-pointer no-underline hover:underline"
                    onClick={() => router.push(`/party/${value}`)}>
                    갓생을 위한 노동요
                  </h2>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-x-3">
                      <div className="w-20 h-11 bg-slate-500 rounded"></div>
                      <p className="text-[#DADADA] text-sm">
                        김윤아 2집 - 10. 증오는 나의 힘 &#40;가사포함&#41;
                      </p>
                    </div>
                    <hr className="bg-[#2f2f2f]" />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-x-11">
                        <div className="flex items-center">
                          <Image
                            src="/icons/icn_person_outline.svg"
                            alt="채팅"
                            width={24}
                            height={24}
                          />
                          <span className="inline-block ml-1.5 text-[#dadada]">48</span>
                        </div>
                        <ul className="flex items-center gap-x-2">
                          {[1, 2, 3].map(value => (
                            <li key={value} className="w-6 h-6 rounded-full bg-slate-400"></li>
                          ))}
                        </ul>
                      </div>
                      <Image src="/icons/icn_info_outline.svg" alt="채팅" width={24} height={24} />
                    </div>
                  </div>
                  {isHover && (
                    <div className="absolute top-0 left-0 w-full h-full bg-black/90 p-7 pr-10 flex flex-col justify-between">
                      <p className="text-[#F5F5F5] whitespace-pre-line">
                        기준
                        <br />
                        톰보이&#40;&#40;G&#41;I-DLE&#41; 포즈를 하고 싶어지는가 지금 내가 제법
                        락스타 같아 보이는가
                      </p>
                      <div className="flex justify-end">
                        <button className="inline-flex items-center justify-center rounded border border-[#B41024] py-1.5 px-3 gap-x-2">
                          <span className="text-[#B41024] text-sm">입장하기</span>
                          <Image src="/icons/icn_right.svg" alt="입장하기" width={14} height={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
          <CreatePartyModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </SidebarLayout>
      </div>
    </RootLayout>
  )
}

export default PartyRoomListPage
