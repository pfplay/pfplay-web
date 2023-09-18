'use client';
import Image from 'next/image';
import React, { FC, Fragment, PropsWithChildren, PropsWithRef, ReactNode, useMemo } from 'react';
import { Dialog as HUDialog, Transition } from '@headlessui/react';
import Button, { ButtonProps } from '@/components/@shared/@atoms/Button';
import Typography, { TypographyProps } from '@/components/@shared/@atoms/Typography';
import { cn } from '@/utils/cn';
import { wrapByTag } from '@/utils/wrapByTag';

interface DialogComposition {
  ButtonGroup: FC<PropsWithChildren>;
  Button: FC<Omit<PropsWithRef<ButtonProps>, 'size'>>;
}

interface StrWithEmphasis {
  fullPhrase: string;
  emphasisPhrase: string | string[];
}
export interface DialogProps {
  open: boolean;
  title: string | StrWithEmphasis;
  titleAlign?: 'left' | 'center';
  Sub?: ReactNode;
  Body: FC | ReactNode;
  onClose: () => void;
  id?: string;
  showCloseIcon?: boolean;
  classNames?: {
    container?: string;
  };
}

const getEmphasisedInnerHTML = (strWithEmphasis: StrWithEmphasis): string => {
  const { fullPhrase, emphasisPhrase } = strWithEmphasis;
  return wrapByTag(
    fullPhrase,
    [emphasisPhrase].flat().map((v) => ({
      targetPhrase: v,
      tag: 'strong',
      tagAttr: { class: 'text-red-300' },
    }))
  );
};

const Dialog: FC<DialogProps> & DialogComposition = ({
  open,
  title,
  Sub,
  Body,
  onClose,
  id,
  titleAlign = 'center',
  showCloseIcon,
  classNames,
}) => {
  const Title = useMemo(() => {
    const titleProps: PropsWithRef<TypographyProps> = {
      type: 'body1',
      className: 'text-gray-50',
    };

    if (typeof title === 'string') {
      return <Typography {...titleProps}>{title}</Typography>;
    }

    const titleInnerHTML = getEmphasisedInnerHTML(title);
    return <Typography {...titleProps} dangerouslySetInnerHTML={{ __html: titleInnerHTML }} />;
  }, [title]);

  return (
    <Transition appear show={open} as={Fragment}>
      <HUDialog as='div' className='relative z-dialog' onClose={onClose} id={id}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-dim' />
        </Transition.Child>

        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <HUDialog.Panel
                className={cn(
                  'pt-[52px] px-[32px] pb-[32px] w-[400px] max-w-full transform rounded-[6px] bg-gray-800 border border-gray-700 transition-all',
                  classNames?.container
                )}
              >
                <HUDialog.Title
                  as='div'
                  className={cn([
                    'relative flexCol gap-[12px] mb-[24px]',
                    {
                      'items-start': titleAlign === 'left',
                      'items-center': titleAlign === 'center',
                    },
                  ])}
                >
                  {showCloseIcon && (
                    <Button
                      color='secondary'
                      variant='outline'
                      Icon={<Image src='/icons/icn_close.svg' alt='close' width={24} height={24} />}
                      className='border-none p-0 absolute top-[2.5px] right-0' /*  */
                      onClick={onClose}
                    />
                  )}

                  {Title}

                  {Sub}
                </HUDialog.Title>

                {typeof Body === 'function' ? <Body /> : Body}
              </HUDialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </HUDialog>
    </Transition>
  );
};

const DialogButtonGroup: DialogComposition['ButtonGroup'] = ({ children }) => {
  return <section className='mt-[36px] flex w-full justify-center gap-[8px]'>{children}</section>;
};
const DialogButton: DialogComposition['Button'] = ({ children, className, ...rest }) => {
  return (
    <Button size='xl' className={cn('flex-1', className)} {...rest}>
      {children}
    </Button>
  );
};

Dialog.ButtonGroup = DialogButtonGroup;
Dialog.Button = DialogButton;

export default Dialog;
