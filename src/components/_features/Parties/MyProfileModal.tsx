import Image from 'next/image';
import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface MyProfileModalProps {
  isOpen: boolean;
  onModalClose: () => void;
}

const MyProfileModal = ({ isOpen, onModalClose }: MyProfileModalProps) => {
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
              <Dialog.Panel className='w-full max-w-[800px] transform overflow-hidden rounded-md bg-grey-800  p-10  pb-14  text-left align-middle shadow-xl transition-all'>
                <button onClick={onModalClose} className='absolute right-10 top-10'>
                  <Image src='/icons/icn_close.svg' alt='close' width={20} height={20} />
                </button>
                <Dialog.Title as='h1' className='text-left font-bold text-xl mb-12 text-grey-50'>
                  내 프로필
                </Dialog.Title>
                <div>
                  <div className='flex mt-5 mb-6'>
                    <div className='w-20 h-[200px] bg-slate-100 ml-[60px] mr-[68px]'>
                      아바타 이미지 영역
                    </div>
                    <div className='flex flex-col max-w-[300px]'>
                      <div className='flex gap-x-3 items-center'>
                        <p className='text-xl font-bold text-grey-200'>FENDI</p>
                        <Image
                          width={18}
                          height={18}
                          src={'/icons/icn_edit.svg'}
                          alt={'수정하기'}
                          className='cursor-pointer'
                        />
                      </div>
                      <p className='text-grey-200 mt-3 text-[15px]'>
                        요즘 뉴진스 안 듣는 사람 아직도 있나요? 플리 채우려 장르 안 가리고 노래 수집
                        중
                      </p>
                    </div>
                  </div>
                  <footer className='flex ml-[54px]'>
                    <button className='inline-flex justify-center items-center border border-red-500 rounded py-1.5 px-3'>
                      <span className='text-sm text-red-300'>아바타 설정</span>
                    </button>
                    <div className='flex gap-x-2 items-center ml-[62px]'>
                      <p className='text-sm text-grey-300'>포인트</p>
                      <span className='text-sm text-grey-200'>72p</span>
                    </div>
                    <div className='flex gap-x-2 items-center ml-[48px]'>
                      <p className='text-sm text-grey-300'>가입일</p>
                      <span className='text-sm text-grey-200'>2022.12.02</span>
                    </div>
                    <div className='ml-auto w-8 h-8 bg-slate-50 mr-5'>rainbow icon</div>
                  </footer>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default MyProfileModal;
