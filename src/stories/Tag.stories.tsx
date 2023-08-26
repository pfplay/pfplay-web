import type { Meta } from '@storybook/react';
import Icons from '@/components/Icons';
import Tag from '@/components/ui/Tag';

const meta = {
  title: 'ui/Tag',
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
  return <Tag variant='profile' value='박가든 garden' prefixIcon={<Icons.profileExample />} />;
};
