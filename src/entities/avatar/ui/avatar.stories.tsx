import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AvatarCompositionType, MotionType, ReactionType } from '@/shared/api/http/types/@enums';
import { Button } from '@/shared/ui/components/button';
import Avatar from './avatar.component';

const meta = {
  title: 'features/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: {
    height: 160,
  },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

const mockBody = {
  uri: '/images/Temp/body.png',
  facePosX: 60,
  facePosY: 9,
};
const mockBodyWithoutFace = {
  uri: '/images/Temp/body-without-face.png',
};
const mockFace = {
  uri: '/images/Temp/face.png',
};

export const Preview: Story = {
  args: {
    compositionType: AvatarCompositionType.BODY_WITH_FACE,
    faceUri: mockFace.uri,
    facePosX: mockBody.facePosX,
    facePosY: mockBody.facePosY,
    bodyUri: mockBody.uri,
    height: 160,
  },
  decorators: [
    (Story) => (
      <div style={{ border: '1px solid rgba(255,255,255,0.2)', width: 'max-content' }}>
        <Story />
      </div>
    ),
  ],
};

export const NoFace: Story = {
  args: {
    bodyUri: mockBodyWithoutFace.uri,
    height: 160,
  },
};

export const Sizes: Story = {
  args: {
    compositionType: AvatarCompositionType.BODY_WITH_FACE,
    faceUri: mockFace.uri,
    facePosX: mockBody.facePosX,
    facePosY: mockBody.facePosY,
    bodyUri: mockBody.uri,
  },
  render: (args) => (
    <>
      <Avatar {...args} height={80} />
      <Avatar {...args} height={120} />
      <Avatar {...args} height={160} />
      <Avatar {...args} height={320} />
    </>
  ),
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
        <Story />
      </div>
    ),
  ],
};

export const Dance: Story = {
  args: {
    height: 160,
    motionType: MotionType.DANCE_TYPE_1,
    compositionType: AvatarCompositionType.BODY_WITH_FACE,
    faceUri: mockFace.uri,
    facePosX: mockBody.facePosX,
    facePosY: mockBody.facePosY,
    bodyUri: mockBody.uri,
  },
  render: (args) => (
    <>
      <Avatar {...args} />
      <Avatar motionType={MotionType.DANCE_TYPE_1} bodyUri={mockBodyWithoutFace.uri} height={160} />
      <Avatar {...args} />
    </>
  ),
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
        <Story />
      </div>
    ),
  ],
};

export const Reaction: Story = {
  args: {
    height: 160,
    compositionType: AvatarCompositionType.BODY_WITH_FACE,
    faceUri: mockFace.uri,
    facePosX: mockBody.facePosX,
    facePosY: mockBody.facePosY,
    bodyUri: mockBody.uri,
  },
  render: (args) => {
    const [reaction, setReaction] = useState<ReactionType>();

    return (
      <>
        <div style={{ display: 'flex', gap: 4, marginBottom: 40 }}>
          {Object.values(ReactionType).map((reactionType) => (
            <Button
              size='sm'
              color={reaction === reactionType ? 'primary' : 'secondary'}
              key={reactionType}
              onClick={() => setReaction(reactionType)}
              style={{ cursor: reaction === reactionType ? 'default' : 'pointer' }}
            >
              {reactionType}
            </Button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
          <Avatar {...args} reaction={reaction} />
          <Avatar {...args} height={120} reaction={reaction} />
          <Avatar bodyUri={mockBodyWithoutFace.uri} height={160} reaction={reaction} />
        </div>
      </>
    );
  },
};
