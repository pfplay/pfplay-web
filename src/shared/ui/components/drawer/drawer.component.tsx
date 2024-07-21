'use client';
import { CSSProperties, Fragment, PropsWithChildren, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Transition } from '@headlessui/react';
import { DomId } from '@/shared/config/dom-id';
import usePortalRoot from '@/shared/lib/hooks/use-portal-root.hook';
import { PFClose } from '@/shared/ui/icons';
import { Typography } from '../typography';

interface DrawerProps {
  title?: string;
  isOpen: boolean;
  close: () => void;
  style?: CSSProperties;
}

/**
 * 현재 우측 고정입니다.
 */
const Drawer = ({ title, isOpen, close, style, children }: PropsWithChildren<DrawerProps>) => {
  const root = usePortalRoot(DomId.DrawerRoot);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('scroll-hidden');
    } else {
      document.body.classList.remove('scroll-hidden');
    }

    return () => {
      document.body.classList.remove('scroll-hidden');
    };
  }, [isOpen]);

  if (!root) return null;
  return (
    <>
      {createPortal(
        <Transition appear show={isOpen} as={Fragment}>
          <div className='relative z-drawer' style={style}>
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
                    <div onClick={close} className='cursor-pointer'>
                      <PFClose width={24} height={24} />
                    </div>
                  </div>
                  {children}
                </div>
              </Transition.Child>
            </div>
          </div>
        </Transition>,
        root
      )}
    </>
  );
};

export default Drawer;
