import type { NextPage } from 'next'
import Image from 'next/image'

export const SubParty: NextPage = () => {
  return (
    <>
      <div
        className="col-span-3 mx-[8px] px-[7px] bg_blur"
        style={{
          backgroundImage:
            'linear-gradient( rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.7) ),url(/image/ariana.png)',
          backgroundSize: 'cover',
        }}>
        <div className="flex flex-col">
          <h3 className="text-[#DADADA] text-[21px] mt-3 ml-3">
            연말느낌 방구석 크리스마스 플레이리스트방
          </h3>
          <div className="flex items-center">
            <div className="">
              <Image
                className="mx-[10px] rounded"
                src="/image/ariana.png"
                alt="ariana"
                width={100}
                height={50}></Image>
            </div>
            <div className="mt-4 ml-5">
              <p className="text-[#DADADA]">Ariana Grande - Santa Tell Me (Official Video)</p>
            </div>
          </div>
          <hr></hr>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-2 text-[#FDFDFD] flex items-end">
              <Image
                className="mt-4 ml-2 pb-3"
                src="/image/icn_person_outline.png"
                alt="person"
                width={16}
                height={16}></Image>
              <p className="text-[12px] pl-1 pb-3">48</p>
            </div>
            <div className="col-span-8 text-[#FDFDFD] flex items-end justify-items-start pb-2">
              <Image
                className="mt-4 mx-[5px] rounded-full"
                src="/image/user1.png"
                alt="person"
                width={24}
                height={24}></Image>
              <Image
                className="mt-4 mx-[5px] rounded-full"
                src="/image/user2.png"
                alt="person"
                width={24}
                height={24}></Image>
              <Image
                className="mt-4 mx-[5px] rounded-full"
                src="/image/user3.jfif"
                alt="person"
                width={24}
                height={24}></Image>
            </div>
            <div className="col-span-2 text-[#FDFDFD] flex items-end">
              <Image
                className="mt-4 mx-[5px] pb-2 rounded-full"
                src="/image/icn_info_outline.png"
                alt="person"
                width={24}
                height={24}></Image>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
export default SubParty
