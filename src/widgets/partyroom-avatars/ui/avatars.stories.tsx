import { useEffect, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AvatarCompositionType, GradeType, MotionType } from '@/shared/api/http/types/@enums';
import { useStores } from '@/shared/lib/store/stores.context';
import Avatars from './avatars.component';

const mockCrews = [
  {
    crewId: 1,
    nickname: 'DJ Mono',
    gradeType: GradeType.HOST,
    avatarCompositionType: AvatarCompositionType.BODY_WITH_FACE,
    avatarBodyUri: '/images/Temp/body.png',
    avatarFaceUri: '/images/Temp/face.png',
    avatarIconUri: '/images/Temp/nft.png',
    combinePositionX: 60,
    combinePositionY: 9,
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    motionType: MotionType.NONE,
  },
  {
    crewId: 2,
    nickname: 'Queue One',
    gradeType: GradeType.CLUBBER,
    avatarCompositionType: AvatarCompositionType.BODY_WITH_FACE,
    avatarBodyUri: '/images/Temp/body.png',
    avatarFaceUri: '/images/Temp/face.png',
    avatarIconUri: '/images/Temp/nft.png',
    combinePositionX: 60,
    combinePositionY: 9,
    offsetX: -0.08,
    offsetY: 0,
    scale: 1,
    motionType: MotionType.DANCE_TYPE_1,
  },
  {
    crewId: 3,
    nickname: 'Floor A',
    gradeType: GradeType.CLUBBER,
    avatarCompositionType: AvatarCompositionType.BODY_WITH_FACE,
    avatarBodyUri: '/images/Temp/body.png',
    avatarFaceUri: '/images/Temp/face.png',
    avatarIconUri: '/images/Temp/nft.png',
    combinePositionX: 60,
    combinePositionY: 9,
    offsetX: 0.05,
    offsetY: 0.02,
    scale: 1,
    motionType: MotionType.NONE,
  },
  {
    crewId: 4,
    nickname: 'Floor B',
    gradeType: GradeType.CLUBBER,
    avatarCompositionType: AvatarCompositionType.BODY_WITH_FACE,
    avatarBodyUri: '/images/Temp/body.png',
    avatarFaceUri: '/images/Temp/face.png',
    avatarIconUri: '/images/Temp/nft.png',
    combinePositionX: 60,
    combinePositionY: 9,
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    motionType: MotionType.DANCE_TYPE_1,
  },
] as const;

function SeedPartyroomStore({ children }: { children: ReactNode }) {
  const { useCurrentPartyroom } = useStores();

  useEffect(() => {
    useCurrentPartyroom.getState().init({
      id: 1,
      me: undefined,
      playbackActivated: false,
      crews: [...mockCrews],
      currentDj: { crewId: 1 },
      notice: '',
    });

    return () => {
      useCurrentPartyroom.getState().reset();
    };
  }, [useCurrentPartyroom]);

  return <>{children}</>;
}

const meta = {
  title: 'features/PartyroomAvatars',
  component: Avatars,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <SeedPartyroomStore>
        <main className='relative w-screen h-screen bg-partyRoom bg-left-bottom overflow-hidden'>
          <Story />
        </main>
      </SeedPartyroomStore>
    ),
  ],
} satisfies Meta<typeof Avatars>;

export default meta;

type Story = StoryObj<typeof meta>;

export const StageRelativeLayout: Story = {
  args: {
    partyroomId: 1,
    enableQueueFetch: false,
    djQueueCrewIdsOverride: [2],
  },
};
