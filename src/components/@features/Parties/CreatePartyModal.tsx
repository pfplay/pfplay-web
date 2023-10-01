import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import PFClose from '@/components/@shared/@icons/navigation/PFClose';

interface CreatePartyModalProps {
  isOpen: boolean;
  onModalClose: () => void;
}

const CreatePartyModal = ({ isOpen, onModalClose }: CreatePartyModalProps) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as='div' className='relative z-10 ' onClose={onModalClose}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black bg-opacity-25' />
        </Transition.Child>

        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flexRowCenter min-h-full p-4 text-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <Dialog.Panel className='w-full max-w-[800px] transform overflow-hidden rounded-md bg-gray-800  p-10  pb-14  text-left align-middle shadow-xl transition-all'>
                <button onClick={onModalClose} className='absolute right-10 top-10'>
                  <PFClose width={20} height={20} />
                </button>
                <Dialog.Title as='h1' className='text-left font-bold text-xl mb-12 text-gray-50'>
                  파티 정보
                </Dialog.Title>
                <div className='px-10'>
                  <div className='flex items-center justify-between'>
                    <div className='w-[70px]'>
                      <p className='text-gray-200 relative'>
                        파티 이름<span className='text-red-300 absolute -right-1 -top-1'>*</span>
                      </p>
                    </div>
                    <div className='w-[537px] py-3 px-4 bg-gray-700 rounded flex items-center justify-between'>
                      <input
                        type='text'
                        className='bg-transparent text-gray-200 text-[15px]'
                        placeholder='22년 여돌 노래 정산 신곡 모음'
                      />
                      <p className='text-gray-400 text-[15px]'>
                        <span className='text-red-300'>18</span>/30
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center justify-between my-12'>
                    <div className='w-[70px]'>
                      <p className='text-gray-200 relative'>
                        파티 소개<span className='text-red-300 absolute -right-1 -top-1'>*</span>
                      </p>
                    </div>
                    <div className='w-[537px] h-[92px] py-3 px-4 bg-gray-700 rounded flex flex-col justify-between'>
                      <textarea
                        className='bg-transparent text-gray-200 text-[15px] w-full resize-none'
                        placeholder='22년 여돌 노래 정산 신곡 모음'
                      />
                      <p className='text-gray-400 text-[15px] flex justify-end'>
                        <span className='text-red-300'>18</span>/30
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-x-8'>
                    <div className='flex items-center'>
                      <div className='w-[52px] mr-[51px]'>
                        <p className='text-gray-200 relative'>
                          도메인<span className='text-red-300 absolute -right-1 -top-1'>*</span>
                        </p>
                      </div>
                      <div className='w-[313px] py-3 px-4 bg-gray-700 rounded flex items-center justify-between'>
                        <input
                          type='text'
                          className='bg-transparent text-gray-200 text-[15px]'
                          placeholder='22년 여돌 노래 정산 신곡 모음'
                        />
                      </div>
                    </div>
                    <div className='flex items-center'>
                      <div className='w-[60px] mr-6'>
                        <p className='text-gray-200 relative leading-tight'>
                          디제잉 제한시간
                          <span className='text-red-300 absolute -right-1 -top-1'>*</span>
                        </p>
                      </div>
                      <div className='py-3 px-4 bg-gray-700 rounded flex items-center justify-center w-[86px]'>
                        <input
                          type='text'
                          className='bg-transparent text-gray-200 text-[15px] w-3'
                          placeholder='7'
                        />
                      </div>
                      <span className='ml-2 text-gray-200'>분</span>
                    </div>
                  </div>
                  <div className='flex items-center justify-end mb-10 mt-12'>
                    <button className='py-3 px-[105px] bg-gradient-red'>
                      <span className='text-gray-50 font-bold'>저장</span>
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CreatePartyModal;
