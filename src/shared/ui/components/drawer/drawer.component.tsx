'use client';
import { CSSProperties, Fragment, PropsWithChildren, ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Transition } from '@headlessui/react';
import { DomId } from '@/shared/config/dom-id';
import { cn } from '@/shared/lib/functions/cn';
import usePortalRoot from '@/shared/lib/hooks/use-portal-root.hook';
import { TextButton } from '@/shared/ui/components/text-button';
import { PFClose } from '@/shared/ui/icons';
import { Typography } from '../typography';

export interface DrawerProps {
  title?: string;
  isOpen: boolean;
  close?: () => void;
  HeaderExtra?: ReactNode;
  style?: CSSProperties;
}

/**
 * 현재 우측 고정입니다.
 */
const Drawer = ({
  title,
  isOpen,
  close,
  HeaderExtra,
  style,
  children,
}: PropsWithChildren<DrawerProps>) => {
  const root = usePortalRoot(DomId.DrawerRoot);

  useEffect(() => {
    if (!isOpen) return;
    // 배경 스크롤 잠금(body overflow:hidden, viewport 로 전파). 전파로 <html>
    // scrollbar 가 사라지므로 그 폭만큼 padding-right 로 보상해 콘텐츠가 좌측으로
    // 밀리는 layout shift 를 막는다. 보상은 <body> 에 건다 — headlessui Dialog 는
    // <html> 의 padding-right 를 자기 계산값으로 덮어쓰므로(드로어 위에서 모달을
    // 열면 r=0 으로 계산해 보상을 0 으로 만든다), 같은 <html> 에 걸면 충돌한다.
    // <body> 는 headlessui 가 건드리지 않아 모달 토글과 무관하게 16px 가 유지된다.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevPaddingRight = document.body.style.paddingRight;
    document.body.classList.add('scroll-hidden');
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.classList.remove('scroll-hidden');
      document.body.style.paddingRight = prevPaddingRight;
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
                  <div className='flexRow justify-between mb-10'>
                    {HeaderExtra}
                    <Typography
                      type='title2'
                      className={cn('text-white', {
                        'text-center': !HeaderExtra && !close,
                        'flex-1': !HeaderExtra && !close,
                      })}
                    >
                      {title}
                    </Typography>
                    {close && (
                      <TextButton
                        onClick={close}
                        Icon={<PFClose width={24} height={24} />}
                        data-testid='drawer-close-button'
                      />
                    )}
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
