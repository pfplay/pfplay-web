import { Modal } from '@mantine/core';

interface IPartyModal {
  isOpen: boolean;
  onClose: () => void;
}
const CreatePartyModal = ({ isOpen, onClose }: IPartyModal) => {
  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      centered
      styles={{
        header: { padding: '20px 20px 48px 20px', margin: 0 },
        modal: { backgroundColor: '#1c1c1c', width: 800 },
        title: { color: '#dfdfdf', fontSize: '24px', fontWeight: 700 },
        close: { color: '#dfdfdf', width: '24px', height: '24px' },
      }}
      title='파티 정보'
    >
      <div className='px-[60px]'>
        <div className='flex items-center justify-between'>
          <div className='w-[70px]'>
            <p className='text-[#DADADA] relative'>
              파티 이름<span className='text-[#F31F2C] absolute -right-1 -top-1'>*</span>
            </p>
          </div>
          <div className='w-[537px] py-3 px-4 bg-[#2F2F2F] rounded flex items-center justify-between'>
            <input
              type='text'
              className='bg-transparent text-[#DADADA] text-[15px]'
              placeholder='22년 여돌 노래 정산 신곡 모음'
            />
            <p className='text-[#707070] text-[15px]'>
              <span className='text-[#F31F2C]'>18</span>/30
            </p>
          </div>
        </div>
        <div className='flex items-center justify-between my-12'>
          <div className='w-[70px]'>
            <p className='text-[#DADADA] relative'>
              파티 소개<span className='text-[#F31F2C] absolute -right-1 -top-1'>*</span>
            </p>
          </div>
          <div className='w-[537px] h-[92px] py-3 px-4 bg-[#2F2F2F] rounded flex flex-col justify-between'>
            <textarea
              className='bg-transparent text-[#DADADA] text-[15px] w-full resize-none'
              placeholder='22년 여돌 노래 정산 신곡 모음'
            />
            <p className='text-[#707070] text-[15px] flex justify-end'>
              <span className='text-[#F31F2C]'>18</span>/30
            </p>
          </div>
        </div>
        <div className='flex items-center gap-x-8'>
          <div className='flex items-center'>
            <div className='w-[52px] mr-[51px]'>
              <p className='text-[#DADADA] relative'>
                도메인<span className='text-[#F31F2C] absolute -right-1 -top-1'>*</span>
              </p>
            </div>
            <div className='w-[313px] py-3 px-4 bg-[#2F2F2F] rounded flex items-center justify-between'>
              <input
                type='text'
                className='bg-transparent text-[#DADADA] text-[15px]'
                placeholder='22년 여돌 노래 정산 신곡 모음'
              />
            </div>
          </div>
          <div className='flex items-center'>
            <div className='w-[60px] mr-6'>
              <p className='text-[#DADADA] relative leading-tight'>
                디제잉 제한시간<span className='text-[#F31F2C] absolute -right-1 -top-1'>*</span>
              </p>
            </div>
            <div className='py-3 px-4 bg-[#2F2F2F] rounded flex items-center justify-center w-[86px]'>
              <input
                type='text'
                className='bg-transparent text-[#DADADA] text-[15px] w-3'
                placeholder='7'
              />
            </div>
            <span className='ml-2 text-[#DADADA]'>분</span>
          </div>
        </div>
        <div className='flex items-center justify-end mb-10 mt-12'>
          <button className='py-3 px-[105px] bg-gradient-to-r from-[#780808] to-[#AE001F]'>
            <span className='text-[#FDFDFD] font-bold'>저장</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreatePartyModal;
