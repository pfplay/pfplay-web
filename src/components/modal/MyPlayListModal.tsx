import { Menu } from '@headlessui/react'
import Image from 'next/image'
import Modal from 'react-modal'

import MyPlayListComponent from '../partylist/MyPlayListComponent'

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
          <MyPlayListComponent></MyPlayListComponent>
          <MyPlayListComponent></MyPlayListComponent>
          <MyPlayListComponent></MyPlayListComponent>
        </div>
      </div>
      {/* Footer */}
    </Modal>
  )
}
