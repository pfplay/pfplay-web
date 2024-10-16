'use client';
import { FC, Fragment, PropsWithChildren, PropsWithRef, ReactNode, useMemo, useRef } from 'react';
import { Dialog as HUDialog, Transition } from '@headlessui/react';
import { cn } from '@/shared/lib/functions/cn';
import theme from '@/shared/ui/foundation/theme';
import { PFClose } from '@/shared/ui/icons';
import { Button, ButtonProps } from '../button';
import { Typography, TypographyType } from '../typography';

type DialogComposition = {
  ButtonGroup: FC<PropsWithChildren>;
  Button: FC<Omit<PropsWithRef<ButtonProps>, 'size'>>;
};

type TitleProps = {
  defaultTypographyType: TypographyType;
  defaultClassName: string;
};

export type DialogProps = {
  id?: string;
  open: boolean;
  /**
   * string 타입이면 typography로 래핑됩니다.
   */
  title?: string | ((props: TitleProps) => ReactNode);
  titleAlign?: 'left' | 'center';
  Sub?: ReactNode;
  Body: FC | ReactNode;
  onClose: () => void;
  closeConfirm?: () => Promise<boolean | undefined>;
  /**
   * @default true
   */
  closeWhenOverlayClicked?: boolean;
  /**
   * @default false
   */
  showCloseIcon?: boolean;
  /**
   * @default false
   */
  hideDim?: boolean;
  classNames?: {
    container?: string;
  };
  zIndex?: number;
};

const Dialog: FC<DialogProps> & DialogComposition = ({
  open,
  title,
  Sub,
  Body,
  onClose,
  closeConfirm,
  closeWhenOverlayClicked = true,
  id,
  titleAlign = 'center',
  showCloseIcon = false,
  hideDim = false,
  classNames,
  zIndex = theme.zIndex.dialog,
}) => {
  const Title = useMemo(() => {
    if (!title) return null;

    const titleProps: TitleProps = {
      defaultTypographyType: 'body1',
      defaultClassName: 'text-gray-50 whitespace-pre-line',
    };

    if (typeof title === 'string') {
      return (
        <Typography type={titleProps.defaultTypographyType} className={titleProps.defaultClassName}>
          {title}
        </Typography>
      );
    }

    return title(titleProps);
  }, [title]);

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
      <HUDialog
        as='div'
        className='relative'
        style={{ zIndex }}
        onClick={closeWhenOverlayClicked ? handleClose : undefined}
        onClose={
          () => {} /* 여기 close function 을 넣으면 중첩 모달 띄울 때 중첩 모달 내 인터랙션에 의해 직전 모달이 닫혀 버리는 문제가 있음. 해서 onClick 에서 컨트롤 */
        }
        id={id}
      >
        {!hideDim && (
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
        )}

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
                {title && (
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
                        className='border-none p-0 absolute top-[2.5px] right-0'
                        onClick={handleClose}
                      />
                    )}

                    {Title}

                    {Sub}
                  </HUDialog.Title>
                )}

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
