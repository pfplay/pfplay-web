import type { Meta } from '@storybook/react';
import Tag from '@/components/@shared/@atoms/Tag';
import Icons from '@/components/__legacy__/Icons';

const meta = {
  title: '@atoms/Tag',
  tags: ['autodocs'],
  component: Tag,
} satisfies Meta<typeof Tag>;

export default meta;

export const FilledTag = () => {
  return <Tag value='filled' variant='filled' />;
};

export const OutlinedTag = () => {
  return <Tag value='outlined' variant='outlined' />;
};

export const ProfileTag = () => {
  return <Tag variant='profile' value='박가든 garden' PrefixIcon={<Icons.profileExample />} />;
};
