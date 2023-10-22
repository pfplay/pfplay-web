import { FC, PropsWithChildren } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Typography, { TypographyType } from '@/components/shared/atoms/Typography';

const meta = {
  title: 'atoms/Typography',
  tags: ['autodocs'],
  component: Typography,
} satisfies Meta<typeof Typography>;

export default meta;

export const Preview: StoryObj<typeof meta> = {
  args: {
    children:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
  },
};

export const Default = () => {
  const dict: Record<TypographyType, { weight: number; size: number; lineHeight: number }> = {
    title1: { weight: 700, size: 28, lineHeight: 1.3 },
    title2: { weight: 700, size: 24, lineHeight: 1.3 },
    body1: { weight: 700, size: 20, lineHeight: 1.5 },
    body2: { weight: 700, size: 18, lineHeight: 1.5 },
    body3: { weight: 700, size: 16, lineHeight: 1.5 },
    detail1: { weight: 400, size: 16, lineHeight: 1.5 },
    detail2: { weight: 600, size: 14, lineHeight: 1.5 },
    caption1: { weight: 400, size: 14, lineHeight: 1.5 },
    caption2: { weight: 400, size: 12, lineHeight: 1.5 },
  };

  return (
    <section className='p-[15px]'>
      <section className='grid grid-cols-4 border-b border-b-gray-200 pb-[15px] mb-[40px]'>
        <Typography type='detail1'>Type</Typography>
        <Typography type='detail1'>Weight</Typography>
        <Typography type='detail1'>Size</Typography>
        <Typography type='detail1'>Line Height</Typography>
      </section>

      <section className='flexCol gap-[30px]'>
        {Object.entries(dict).map(([type_, { weight, size, lineHeight }]) => {
          const type = type_ as TypographyType;
          return (
            <section className='grid grid-cols-4' key={type}>
              <Typography type={type}>{type}</Typography>
              <Typography type={type}>{weight}</Typography>
              <Typography type={type}>{size}</Typography>
              <Typography type={type}>{lineHeight}</Typography>
            </section>
          );
        })}
      </section>
    </section>
  );
};
export const Overflow = () => {
  const LONG_TEXT = `Looooooooooo ooooooooooo oooooooooooo ooooooooooooo ooooooooooo oooooooooo ooooooooooo oooooog`;

  return (
    <section className='flexCol w-[400px] gap-[10px] border-r border-r-dim border-dotted'>
      <PropDesc tag={`overflow=undefined`}>
        <Typography>{LONG_TEXT}</Typography>
      </PropDesc>

      <PropDesc tag={`overflow="ellipsis"`}>
        <Typography overflow='ellipsis'>{LONG_TEXT}</Typography>
      </PropDesc>

      <PropDesc tag={`overflow="break-words"`}>
        <Typography overflow='break-words'>{LONG_TEXT}</Typography>
      </PropDesc>

      <PropDesc tag={`overflow="break-all"`}>
        <Typography overflow='break-all'>{LONG_TEXT}</Typography>
      </PropDesc>
    </section>
  );
};

export const As = () => {
  return (
    <section className='flexCol w-[400px] gap-[10px]'>
      <PropDesc tag='as=undefined'>
        <section>
          <Typography>Content 1</Typography>
          <Typography>Content 2</Typography>
        </section>
      </PropDesc>

      <PropDesc tag='as="span"'>
        <section>
          <Typography as='span'>Content 1</Typography>
          <Typography as='span'>Content 2</Typography>
        </section>
      </PropDesc>
    </section>
  );
};

const PropDesc: FC<PropsWithChildren<{ tag: string }>> = ({ tag, children }) => (
  <section className='[&:not(:first-of-type)]:mt-3'>
    <Typography
      type='caption1'
      className='w-fit rounded border border-gray-300 text-white bg-gray-600 px-2 py-0.5 mb-0.5'
    >
      {tag}
    </Typography>

    {children}
  </section>
);
