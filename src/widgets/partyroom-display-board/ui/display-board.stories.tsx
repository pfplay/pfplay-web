import { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PartyroomPlayback, PartyroomReaction } from '@/shared/api/http/types/partyrooms';
import { useStores } from '@/shared/lib/store/stores.context';
import { Button } from '@/shared/ui/components/button';
import DisplayBoard from './display-board.component';

const meta = {
  title: 'features/PartyroomDisplayBoard',
  component: DisplayBoard,
  tags: ['autodocs'],
  args: {
    width: 512,
  },
  decorators: [
    (Story) => (
      <div className='bg-partyRoom flexColCenter gap-[20px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DisplayBoard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {
  render: Render,
};

function Render(args: typeof meta.args) {
  const { useCurrentPartyroom } = useStores();
  const { playback, updatePlayback, updateReaction, updateNotice } = useCurrentPartyroom();

  const mockPlaybacks: PartyroomPlayback[] = [
    {
      name: `NewJeans (뉴진스) 'Hype Boy' Official MV (Performance ver.1)`,
      linkId: '11cta61wi0g',
      duration: '03:20',
      endTime: get_UTC_HHMMSS_WithOffset(120),
    },
    {
      name: `COVER | SOLE & THAMA 'Close to you' | Original by The Carpenters`,
      linkId: 'RuORKyaDPCo',
      duration: '02:30',
      endTime: get_UTC_HHMMSS_WithOffset(100),
    },
  ];

  const init = () => {
    updatePlayback(mockPlaybacks[0]);
    updateReaction(mockReactions[0]);
    updateNotice('No slander or socialising between members. Violators will be banned immediately');
  };

  const clear = () => {
    updatePlayback(undefined);
    updateReaction(undefined);
    updateNotice('');
  };

  const changePlayback = () => {
    updatePlayback((prev) => findNextIndex(mockPlaybacks, prev, (v) => v?.linkId));
    updateReaction((prev) =>
      findNextIndex(mockReactions, prev, (v) => v?.aggregation.likeCount.toString())
    );
  };

  useEffect(() => {
    init();

    return clear;
  }, []);

  return (
    <>
      <DisplayBoard {...args} />

      <div className='flex gap-[10px]'>
        {playback ? (
          <>
            <Button onClick={changePlayback} variant='outline' size='xl' color='primary'>
              Change Playback
            </Button>
            <Button onClick={clear} variant='outline' size='xl' color='secondary'>
              Clear
            </Button>
          </>
        ) : (
          <Button onClick={init} variant='outline' size='xl' color='primary'>
            Init
          </Button>
        )}
      </div>
    </>
  );
}

function findNextIndex<T>(
  array: T[],
  current: T | undefined,
  getUnique: (item?: T) => string | undefined
) {
  const index = array.findIndex((item) => getUnique(item) === getUnique(current));
  const nextIndex = (index + 1) % array.length;

  return array[nextIndex];
}

function get_UTC_HHMMSS_WithOffset(offsetSeconds: number) {
  const date = new Date();
  date.setSeconds(date.getSeconds() + offsetSeconds);

  return date.toISOString().split('T')[1].split('.')[0];
}

const mockReactions: PartyroomReaction[] = [
  {
    history: {
      like: true,
      dislike: false,
      grab: true,
    },
    aggregation: {
      likeCount: 10,
      dislikeCount: 4,
      grabCount: 7,
    },
    motion: [],
  },
  {
    history: {
      like: false,
      dislike: true,
      grab: false,
    },
    aggregation: {
      likeCount: 0,
      dislikeCount: 2,
      grabCount: 1,
    },
    motion: [],
  },
];
