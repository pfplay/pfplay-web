import { Menu } from '@headlessui/react'
import type { NextPage } from 'next'
import Image from 'next/image'

const MyPlayListComponent: NextPage = () => {
  return (
    <>
      {/* 진입 화면 코드 */}
      <Menu as="div">
        <div className="flex flex-grow">
          <Menu.Button className="flex items-center flex-grow bg-[#1C1C1C] rounded pt-2 pb-2 px-2 mt-1">
            <p className="text-[#DADADA] text-[14px] max-w-[250px] truncate ...">
              상큼 아이돌 곡 상큼 아이돌 곡상큼 아이돌 곡상큼 아이돌 곡상큼 아이돌 곡상큼 아이돌
              곡상큼 아이돌 곡
            </p>
            <p className="text-[#DADADA] text-[10px] ml-2">17곡</p>
            <div className="flex flex-grow justify-end">
              <Image
                className="rounded-full ml-1"
                src="/image/Vector_2.png"
                alt="close"
                width={14}
                height={14}></Image>
            </div>
          </Menu.Button>
        </div>
        <Menu.Items>
          <div className="mb-4">
            <Menu.Item>
              <div className="flex flex-row items-center">
                <Image
                  className="mt-4 rounded"
                  src="/image/newjeans.png"
                  alt="jeans"
                  width={100}
                  height={50}></Image>
                <div className="flex flex-col">
                  <p className="text-[#DADADA] text-[14px] mt-3 ml-2">
                    NewJeans (뉴진스) Hype Boy Official MV (Performance ver.1)
                  </p>
                  <p className="text-[#DADADA] text-[10px] ml-2 flex justify-end mr-5">04:42</p>
                </div>
              </div>
            </Menu.Item>
            <Menu.Item>
              <div className="flex flex-row items-center">
                <Image
                  className="mt-4 rounded"
                  src="/image/newjeans.png"
                  alt="jeans"
                  width={100}
                  height={50}></Image>
                <div className="flex flex-col">
                  <p className="text-[#DADADA] text-[14px] mt-3 ml-2">
                    NewJeans (뉴진스) Hype Boy Official MV (Performance ver.1)
                  </p>
                  <p className="text-[#DADADA] text-[10px] ml-2 flex justify-end mr-5">04:42</p>
                </div>
              </div>
            </Menu.Item>
            <Menu.Item>
              <div className="flex flex-row items-center">
                <Image
                  className="mt-4 rounded"
                  src="/image/newjeans.png"
                  alt="jeans"
                  width={100}
                  height={50}></Image>
                <div className="flex flex-col">
                  <p className="text-[#DADADA] text-[14px] mt-3 ml-2">
                    NewJeans (뉴진스) Hype Boy Official MV (Performance ver.1)
                  </p>
                  <p className="text-[#DADADA] text-[10px] ml-2 flex justify-end mr-5">04:42</p>
                </div>
              </div>
            </Menu.Item>
          </div>
        </Menu.Items>
      </Menu>
    </>
  )
}
export default MyPlayListComponent
