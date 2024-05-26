'use client';
import { Fragment, PropsWithChildren, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { PFClose } from '@/shared/ui/icons';
import { Typography } from '../typography';

interface DrawerProps {
  title?: string;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

/**
 * 현재 우측 고정입니다.
 */
const Drawer = ({ title, drawerOpen, setDrawerOpen, children }: PropsWithChildren<DrawerProps>) => {
  useEffect(() => {
    if (drawerOpen) {
      document.body.classList.add('scroll-hidden');
    } else {
      document.body.classList.remove('scroll-hidden');
    }

    return () => {
      document.body.classList.remove('scroll-hidden');
    };
  }, [drawerOpen]);

  return (
    <Transition appear show={drawerOpen} as={Fragment}>
      <div className='relative z-30'>
        <div className='pointer-events-none fixed inset-y-0 right-0 flex max-w-full'>
          <Transition.Child
            as={Fragment}
            enter='linear duration-300'
            enterFrom='-right-full'
            enterTo='right-0'
            leave='linear duration-300'
            leaveFrom='right-0'
            leaveTo='-right-full'
          >
            <div className='pointer-events-auto relative w-screen max-w-md h-full flexCol px-7 py-14 overflow-y-auto bg-black shadow-xl border-l border-gray-700'>
              <div className='flexRow justify-between'>
                <Typography type='title2' className='text-white'>
                  {title}
                </Typography>
                <div onClick={() => setDrawerOpen(false)} className='cursor-pointer'>
                  <PFClose width={24} height={24} />
                </div>
              </div>
              {children}
            </div>
          </Transition.Child>
        </div>
      </div>
    </Transition>
  );
};

export default Drawer;
