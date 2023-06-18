import { Modal } from '@mantine/core'
import Image from 'next/image'

interface IMyProfileProps {
  isOpen: boolean
  onClose: () => void
}

const MyProfile = ({ isOpen, onClose }: IMyProfileProps) => {
  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      styles={{
        header: { padding: '8px 20px', margin: 0 },
        modal: { backgroundColor: '#1c1c1c', width: 680 },
        title: { color: '#f5f5f5', fontSize: '16px' },
        close: { color: '#f5f5f5', width: '24px', height: '24px' },
        root: { padding: 0 },
      }}
      centered
      title="내 프로필">
      <div>
        <div className="flex mt-5 mb-6">
          <div className="w-20 h-[200px] bg-slate-100 ml-[60px] mr-[68px]">아바타 이미지 영역</div>
          <div className="flex flex-col max-w-[300px]">
            <div className="flex gap-x-3 items-center">
              <p className="text-xl font-bold text-[#dadada]">FENDI</p>
              <Image
                width={18}
                height={18}
                src={'/icons/icn_edit.svg'}
                alt={'수정하기'}
                className="cursor-pointer"
              />
            </div>
            <p className="text-[#dadada] mt-3 text-[15px]">
              요즘 뉴진스 안 듣는 사람 아직도 있나요? 플리 채우려 장르 안 가리고 노래 수집 중
            </p>
          </div>
        </div>
        <footer className="flex ml-[54px]">
          <button className="inline-flex justify-center items-center border border-[#990316] rounded py-1.5 px-3">
            <span className="text-sm text-[#F31F2C]">아바타 설정</span>
          </button>
          <div className="flex gap-x-2 items-center ml-[62px]">
            <p className="text-sm text-[#969696]">포인트</p>
            <span className="text-sm text-[#DADADA]">72p</span>
          </div>
          <div className="flex gap-x-2 items-center ml-[48px]">
            <p className="text-sm text-[#969696]">가입일</p>
            <span className="text-sm text-[#DADADA]">2022.12.02</span>
          </div>
          <div className="ml-auto w-8 h-8 bg-slate-50 mr-5">rainbow icon</div>
        </footer>
      </div>
    </Modal>
  )
}
export default MyProfile
