import Image from 'next/image';
import type { Meta } from '@storybook/react';
import Tag from './tag.component';

const meta = {
  title: 'base/Tag',
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
  return (
    <Tag
      variant='profile'
      value='박가든 garden'
      PrefixIcon={<Image src='/images/Temp/nft.png' alt='' width={20} height={20} />}
    />
  );
};
