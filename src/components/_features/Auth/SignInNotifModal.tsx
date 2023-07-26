import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface SignInNotifModalProps {
  isOpen: boolean;
  onModalClose: () => void;
  onConfirmClick: () => void;
  onCancelClick: () => void;
}

const SignInNotifModal = ({
  isOpen,
  onModalClose,
  onConfirmClick,
  onCancelClick,
}: SignInNotifModalProps) => {
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
          <div className='flexRowCenter min-h-full  p-4 text-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-md bg-grey-800 pt-[52px] pb-8 px-[17px] text-left align-middle shadow-xl transition-all'>
                <Dialog.Title as='h1' className='text-center font-bold text-xl mb-3 text-grey-50'>
                  잠깐만요!
                </Dialog.Title>
                <div className='mt-3'>
                  <p className='text-center font-normal text-sm whitespace-pre-line mb-9 text-grey-300'>
                    비로그인 입장 시 접근 가능한 기능이 제한됩니다 구글 계정을 연동하면 온전한
                    서비스를 즐길 수 있어요
                  </p>
                </div>

                <div className='flexRow justify-center mt-8'>
                  <button
                    onClick={onCancelClick}
                    type='button'
                    className='text-grey-50 text-center font-bold text-sm px-7 py-3 bg-grey-700 rounded mr-3 w-[166px]'
                  >
                    비로그인 입장하기
                  </button>
                  <button
                    type='button'
                    onClick={onConfirmClick}
                    className='text-grey-50 text-center font-bold text-sm px-7 py-3 rounded w-[166px] bg-gradient-red'
                  >
                    구글 연동하기
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SignInNotifModal;
