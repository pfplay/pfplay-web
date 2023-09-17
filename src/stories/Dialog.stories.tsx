import { useMemo, useRef, useState } from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import Button from '@/components/@shared/@atoms/Button';
import Tag from '@/components/@shared/@atoms/Tag';
import Typography from '@/components/@shared/@atoms/Typography';
import Dialog from '@/components/@shared/Dialog';
import FormItem from '@/components/@shared/FormItem';
import Icons from '@/components/__legacy__/Icons';
import { useDialog } from '@/hooks/useDialog';
import { cn } from '@/utils/cn';
import { delay } from '@/utils/delay';

const meta = {
  title: 'ui/Dialog',
  component: Dialog,
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryFn<typeof meta>;

export const Simply: Story = () => {
  const { openDialog } = useDialog();

  const openSimpleDialog = () => {
    return openDialog((onOk) => ({
      title: '환영합니다!',
      Body: () => (
        <Dialog.ButtonGroup>
          <Dialog.Button onClick={() => onOk()}>확인</Dialog.Button>
        </Dialog.ButtonGroup>
      ),
    }));
  };

  return <Button onClick={openSimpleDialog}>Click</Button>;
};

export const Fully: Story = () => {
  const { openDialog } = useDialog();

  const openFullDialog = () => {
    return openDialog<number>((onOk, onCancel) => ({
      title: { fullPhrase: '확인을 누르면 1000을 반환합니다', emphasisPhrase: '1000' },
      Sub: (
        <Typography type='detail1' className='text-gray-300'>
          취소를 누르면 항상 <span className='text-red-300'>undefined</span> 를 반환해요.
        </Typography>
      ),
      Body: () => {
        const [spread, setSpread] = useState(false);

        return (
          <>
            <Typography type='caption1' className='text-gray-50'>
              Overlay 영역을 누르면 취소를 누르는 것과 똑같이 동작해요.
            </Typography>

            <Button
              color='secondary'
              variant='outline'
              className={cn(['w-full mt-[20px]', spread && 'h-[800px]'])}
              onClick={() => setSpread((prev) => !prev)}
            >
              {spread ? '⬆' : '높이를 늘려보세요 ⬇'}
            </Button>

            <Dialog.ButtonGroup>
              <Dialog.Button color='secondary' onClick={onCancel}>
                취소
              </Dialog.Button>
              <Dialog.Button onClick={() => onOk(1000)}>확인</Dialog.Button>
            </Dialog.ButtonGroup>
          </>
        );
      },
    }));
  };

  const handleClickButton = async () => {
    const result = await openFullDialog();

    if (result) alert(`확인됐어요. (value: ${result})`);
    if (!result) alert('취소됐어요.');
  };

  return <Button onClick={handleClickButton}>Click</Button>;
};

export const Predefined: Story = () => {
  const { openAlertDialog, openConfirmDialog, openErrorDialog } = useDialog();
  const [errorButtonLoading, setErrorButtonLoading] = useState(false);

  const buttonHandlers = {
    alert: () => {
      openAlertDialog({
        title: 'Alert title',
        Sub: (
          <Typography type='detail1' className='text-gray-300'>
            Alert Sub
          </Typography>
        ),
        content: 'Alert content',
        okText: 'okText',
      });
    },
    confirm: async () => {
      const confirmed = await openConfirmDialog({
        title: 'Confirm title',
        Sub: (
          <Typography type='detail1' className='text-gray-300'>
            Confirm Sub
          </Typography>
        ),
        content: 'Confirm content',
        okText: 'okText',
        cancelText: 'cancelText',
      });

      if (confirmed) alert(`확인됐어요.`);
      if (!confirmed) alert('취소됐어요.');
    },
    error: async () => {
      setErrorButtonLoading(true);
      await delay(2000);
      await openErrorDialog('에러가 이런이런 이유로 발생했어요.');
      setErrorButtonLoading(false);
    },
  };

  return (
    <div className='flex gap-[20px]'>
      <Button onClick={buttonHandlers.alert}>Alert</Button>
      <Button onClick={buttonHandlers.confirm}>Confirm</Button>
      <Button onClick={buttonHandlers.error} loading={errorButtonLoading}>
        Error
      </Button>
    </div>
  );
};

export const Stream: Story = () => {
  const [count, setCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const intervalRef = useRef<NodeJS.Timer>();

  const streamLike = useMemo(() => {
    const stopCount = () => {
      clearInterval(intervalRef.current);
    };
    const startCount = () => {
      intervalRef.current = setInterval(() => {
        setCount((prev) => prev + 1);
      }, 500);
    };

    return {
      stopCount,
      startCount,
    };
  }, []);

  const handleOpenDialog = () => {
    setDialogOpen(true);
    streamLike.startCount();
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
    streamLike.stopCount();
    setCount(0);
  };

  return (
    <>
      <Button onClick={handleOpenDialog}>Click</Button>

      <Dialog
        open={dialogOpen}
        title='스트림 Like'
        Body={() => (
          <>
            <Typography type='body3'>count: {count}</Typography>

            <Dialog.ButtonGroup>
              <Dialog.Button onClick={handleCloseDialog}>닫기</Dialog.Button>
            </Dialog.ButtonGroup>
          </>
        )}
        onClose={handleCloseDialog}
      />
    </>
  );
};

export const CustomStructure: Story = () => {
  const { openDialog } = useDialog();
  const TEMP_INPUT_STYLES = 'text-black h-[48px] w-full rounded-[4px] p-[10px]'; // FIXME: 아직 Input 아톰 추가 안됨

  const openSimpleDialog = () => {
    return openDialog((onOk) => ({
      title: 'Title',
      titleAlign: 'left',
      Sub: (
        <Typography type='detail1' className='text-gray-300'>
          Form Sub
        </Typography>
      ),
      showCloseIcon: true,
      classNames: {
        container: 'w-[800px]',
      },
      Body: () => (
        <>
          <div className='flexCol gap-[20px]'>
            <FormItem label='Label' required>
              <input className={TEMP_INPUT_STYLES} />
            </FormItem>
            <FormItem label='Label' required>
              <textarea className={cn(TEMP_INPUT_STYLES, 'h-[200px] leading-[1.5]')} />
            </FormItem>
            <div className='flex flex-wrap gap-[32px] items-center'>
              <FormItem label='Label' required classNames={{ container: 'flex-1 min-w-[200px]' }}>
                <input className={TEMP_INPUT_STYLES} />
              </FormItem>
              <FormItem
                label='Label'
                required
                classNames={{ childrenWrapper: 'flex gap-[16px] items-center' }}
                fit
              >
                <input className={cn(TEMP_INPUT_STYLES, 'w-[84px]')} />
                <Typography type='detail1'>m</Typography>
              </FormItem>
            </div>
            <div className='flex flex-wrap justify-between gap-[32px] items-center'>
              <FormItem label='Label' required>
                <Tag
                  variant='profile'
                  value='박가든 garden'
                  PrefixIcon={<Icons.profileExample />}
                />
              </FormItem>
              <Button size='lg' className='w-[236px]' onClick={() => onOk()}>
                확인
              </Button>
            </div>
          </div>
        </>
      ),
    }));
  };

  return <Button onClick={openSimpleDialog}>Click</Button>;
};
