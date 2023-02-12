import Image from 'next/image'
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
    width: 680,
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    border: '1px solid #2F2F2F',
  },
}

interface IMyProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export const MyProfileModal = ({ isOpen, onClose }: IMyProfileModalProps) => {
  return (
    <Modal style={customStyles} isOpen={isOpen} ariaHideApp={false}>
      {/* Header */}
      <div className="flex justify-between mx-1">
        <div>
          <p className="text-[#DADADA] text-[21px]">내 프로필</p>
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
      {/* Contents */}
      <div className="grid grid-rows-3 grid-flow-col gap-4 mx-5">
        <div className="row-span-3 mt-5 bg-[#DADADA]">Avartar Area</div>
        <div className="col-span-2 mt-5 flex">
          <div className="ml-5 mr-3 flex items-center">
            <p className="text-[#DADADA] text-[21px]">Fendi</p>
          </div>
          <div className="flex items-center">
            <Image
              className="rounded-full"
              src="/image/icn_edit.png"
              alt="close"
              width={20}
              height={20}></Image>
          </div>
        </div>
        <div className="col-span-2 ml-5">
          <p className="text-[#DADADA] text-[21px]">
            요즘 뉴진스 안듣는 사람 아직도 있나요? 플리 채우려 장르 안가리고 노래 수집 중
          </p>
        </div>
        <div className="col-span-2"></div>
      </div>
      {/* Footer */}
      <div className="flex mt-5 mx-5">
        <div className="basis-1/4">
          <button
            className=""
            style={{
              borderWidth: '1px',
              borderRadius: '4px',
              borderBlockColor: 'red',
              borderLeftColor: 'red',
              borderRightColor: 'red',
              boxSizing: 'border-box',
            }}>
            <p className="text-[#F31F2C] text-[15px] mx-1 mt-1 mb-1">아바타 설정</p>
          </button>
        </div>
        <div className="basis-1/4 flex items-center">
          <p className="text-[#969696] text-[14px] mr-3">포인트</p>
          <p className="text-[#DADADA] text-[14px]">76p</p>
        </div>
        <div className="basis-1/4 flex items-center">
          <p className="text-[#969696] text-[14px] mr-3">가입일</p>
          <p className="text-[#DADADA] text-[14px]">2022.12.02</p>
        </div>
        <div className="basis-1/4 flex justify-end">
          <Image
            className="rounded-full"
            src="/image/rainbow-app-icon-small 2.png"
            alt="close"
            width={32}
            height={32}></Image>
        </div>
      </div>
    </Modal>
  )
}
