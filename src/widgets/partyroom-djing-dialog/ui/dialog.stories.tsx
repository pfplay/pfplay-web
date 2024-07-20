import type { Meta, StoryFn } from '@storybook/react';
import { Dj, useCurrentPartyroom } from '@/entities/current-partyroom';
import { useDisclosure } from '@/shared/lib/hooks/use-disclosure.hook';
import { Button } from '@/shared/ui/components/button';
import { useDialog } from '@/shared/ui/components/dialog';
import DjingDialog from './dialog.component';

const meta = {
  title: 'features/PartyroomDjingDialog',
  tags: ['autodocs'],
  args: {},
  decorators: [
    (Story) => (
      <div className='bg-partyRoom h-[400px] flexColCenter gap-[12px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;

type Story = StoryFn<typeof meta>;

const generateFakeDj = (unique: string | number): Dj.Model => ({
  uid: `dj-id-${unique}`,
  username: `dj-username-${unique}`,
  avatarIconUrl: '/images/Temp/nft.png',
});
export const Preview: Story = () => {
  const { open, onOpen, onClose } = useDisclosure();
  const { setDjing, resetDjing } = useCurrentPartyroom();
  const { openAlertDialog } = useDialog();

  const registerFakeDj = () => {
    setDjing({
      current: {
        dj: generateFakeDj('current'),
        music: {
          title: 'music-title',
          duration: 180,
        },
      },
      queue: Array.from({ length: 10 }).map((_, index) => generateFakeDj(index)),
    });
    openAlertDialog({
      content: 'Fake DJ가 등록되었습니다.',
    });
  };

  const clearFakeDj = () => {
    resetDjing();
  };

  return (
    <>
      <Button onClick={onOpen} size='xl'>
        Open Dialog
      </Button>

      <Button onClick={registerFakeDj} variant='outline' color='secondary' size='md'>
        Register Fake DJ
      </Button>

      <Button onClick={clearFakeDj} variant='outline' color='secondary' size='md'>
        Clear Fake DJ
      </Button>

      <DjingDialog open={open} close={onClose} />
    </>
  );
};
