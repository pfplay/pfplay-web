import { Menu } from '@headlessui/react'
import Image from 'next/future/image'
import Modal from 'react-modal'

const customStyles: Modal.Styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  content: {
    width: 400,
    height: '100%',
    left: '79%',
    top: '0',
    position: 'fixed',
    bottom: 'auto',
    backgroundColor: 'rgba(0, 0, 0, 1)',
    border: '1px solid #2F2F2F',
    overflow: 'hidden',
  },
}

interface IMyPlayListModalProps {
  isOpen: boolean
  onClose: () => void
}

export const MyPlayListModal = ({ isOpen, onClose }: IMyPlayListModalProps) => {
  return (
    <Modal style={customStyles} isOpen={isOpen} ariaHideApp={false}>
      {/* Header */}
      <div className="flex justify-between mx-1 mb-5">
        <div>
          <p className="text-[#DADADA] text-[21px]">내 플레이리스트</p>
        </div>
        <div></div>
        <div onClick={onClose}>
          <Image
            className="rounded-full"
            src="/image/icn_close.png"
            alt="close"
            width={24}
            height={24}></Image>
        </div>
      </div>
      {/* Settings */}
      <div className="flex flex-row">
        <div className="flex items-center mr-5 bg_btn basis-2/8">
          <Image
            className="rounded-full ml-1"
            src="/image/237.png"
            alt="close"
            width={14}
            height={14}></Image>
          <p className="text-[#DADADA] text-[14px] ml-2 mr-2">곡 추가</p>
        </div>
        <div className="flex items-center bg_btn h-10 basis-3/8">
          <Image
            className="rounded-full ml-1"
            src="/image/237.png"
            alt="close"
            width={14}
            height={14}></Image>
          <p className="text-[#DADADA] text-[14px] ml-2 mr-2">리스트 추가</p>
        </div>
        <div className="flex items-center justify-end flex-auto">
          <p className="text-[#DADADA] text-[14px] ml-2 mr-2">설정</p>
        </div>
      </div>
      {/* Contents */}
      <div className="grid grid-rows-3 grid-flow-col mt-5">
        <div>
          <Menu as="div">
            <div className="flex flex-grow">
              <Menu.Button className="flex items-center flex-grow bg-[#1C1C1C] rounded pt-2 pb-2 px-2 mt-1">
                <p className="text-[#DADADA] text-[14px]">상큼 아이돌 곡</p>
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
              <div>
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

            <div className="flex flex-grow">
              <Menu.Button className="flex items-center flex-grow bg-[#1C1C1C] rounded pt-2 pb-2 px-2 mt-2">
                <p className="text-[#DADADA] text-[14px] max-w-[250px] truncate ...">
                  가사가 좋은 말줄임 인디노래 말줄임 인디노래말줄임 인디노래말줄임 인디노래말줄임
                  인디노래말줄임 인디노래말줄임 인디노래말줄임 인디노래
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
            <div className="flex flex-grow">
              <Menu.Button className="flex items-center flex-grow bg-[#1C1C1C] rounded pt-2 pb-2 px-2 mt-2">
                <p className="text-[#DADADA] text-[14px]">그랩한 곡</p>
                <p className="text-[#DADADA] text-[10px] ml-2">8곡</p>
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
          </Menu>
        </div>
      </div>
      {/* Footer */}
    </Modal>
  )
}
