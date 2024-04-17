'use client';
import { Fragment, PropsWithChildren, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import Typography from '@/shared/ui/components/typography/typography.component';
import { PFClose } from '@/shared/ui/icons';

interface DrawerProps {
  title?: string;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

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
    <>
      {drawerOpen && (
        <Transition appear show={drawerOpen} as={Fragment}>
          <div className='relative z-30'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <div className='pointer-events-none fixed inset-y-0 right-0 flex max-w-full'>
                <div className='pointer-events-auto relative w-screen max-w-md h-full flexCol px-7 py-14 overflow-y-scroll bg-black shadow-xl'>
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
              </div>
            </Transition.Child>
          </div>
        </Transition>
      )}
    </>
  );
};

export default Drawer;
