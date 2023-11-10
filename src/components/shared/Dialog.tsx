'use client';
import { FC, Fragment, PropsWithChildren, PropsWithRef, ReactNode, useMemo, useRef } from 'react';
import { Dialog as HUDialog, Transition } from '@headlessui/react';
import Button, { ButtonProps } from '@/components/shared/atoms/Button';
import Typography, { TypographyProps } from '@/components/shared/atoms/Typography';
import { PFClose } from '@/components/shared/icons';
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
  titleType?: TypographyProps['type'];
  Sub?: ReactNode;
  Body: FC | ReactNode;
  onClose: () => void;
  closeConfirm?: () => Promise<boolean | undefined>;
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
  closeConfirm,
  id,
  titleAlign = 'center',
  titleType = 'body1',
  showCloseIcon,
  classNames,
}) => {
  const Title = useMemo(() => {
    const titleProps: PropsWithRef<TypographyProps> = {
      type: titleType,
      className: 'text-gray-50',
    };

    if (typeof title === 'string') {
      return <Typography {...titleProps}>{title}</Typography>;
    }

    const titleInnerHTML = getEmphasisedInnerHTML(title);
    return <Typography {...titleProps} dangerouslySetInnerHTML={{ __html: titleInnerHTML }} />;
  }, [titleType, title]);

  const closing = useRef(false);
  const handleClose = async () => {
    // NOTE: handleClose 는 x 버튼과 container overlay 클릭, DialogButton 의 onClick 에서 호출되는데
    // HUDialog container 의 onclose 는 버튼 클릭 이후에 한번 더 호출되므로
    // closeConfirm 이 두 번 호출되지 않게 closing 으로 호출 막는 과정 필요
    if (closing.current) return;
    closing.current = true;

    const confirmed = closeConfirm ? await closeConfirm() : true;
    if (confirmed) {
      onClose();
    }

    closing.current = false;
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <HUDialog as='div' className='relative z-dialog' onClose={handleClose} id={id}>
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
                      Icon={<PFClose width={24} height={24} />}
                      className='border-none p-0 absolute top-[2.5px] right-0' /*  */
                      onClick={handleClose}
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
