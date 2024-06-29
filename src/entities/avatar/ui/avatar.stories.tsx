import type { Meta, StoryObj } from '@storybook/react';
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
    dance: true,
    faceUri: mockFace.uri,
    facePosX: mockBody.facePosX,
    facePosY: mockBody.facePosY,
    bodyUri: mockBody.uri,
  },
  render: (args) => (
    <>
      <Avatar {...args} />
      <Avatar dance bodyUri={mockBodyWithoutFace.uri} height={160} />
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
