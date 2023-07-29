import { FC, PropsWithChildren } from 'react';
import type { Meta } from '@storybook/react';
import Typography, { ParagraphType, TitleType } from '@/components/ui/Typography';
import { cn } from '@/lib/utils';

const meta = {
  title: 'ui/Typography',
} satisfies Meta<typeof Typography>;

export default meta;

export const Default = () => {
  const dict: Record<
    TitleType | ParagraphType,
    { Comp: FC<any>; weight: number; size: number; lineHeight: number }
  > = {
    Title1: { Comp: Typography.Title, weight: 700, size: 28, lineHeight: 1.3 },
    Title2: { Comp: Typography.Title, weight: 700, size: 24, lineHeight: 1.3 },
    Body1: { Comp: Typography.Paragraph, weight: 700, size: 20, lineHeight: 1.5 },
    Body2: { Comp: Typography.Paragraph, weight: 700, size: 18, lineHeight: 1.5 },
    Body3: { Comp: Typography.Paragraph, weight: 700, size: 16, lineHeight: 1.5 },
    Detail1: { Comp: Typography.Paragraph, weight: 400, size: 16, lineHeight: 1.5 },
    Detail2: { Comp: Typography.Paragraph, weight: 600, size: 14, lineHeight: 1.5 },
    Caption1: { Comp: Typography.Paragraph, weight: 400, size: 14, lineHeight: 1.5 },
    Caption2: { Comp: Typography.Paragraph, weight: 400, size: 12, lineHeight: 1.5 },
  };

  return (
    <section className='p-[15px]'>
      <h1 className='font-bold text-[60px] leading-[1.2] mb-[60px]'>Typography</h1>

      <section className='grid grid-cols-4 border-b border-b-grey-200 pb-[15px] mb-[40px]'>
        <Typography.Paragraph type='Detail1'>Style</Typography.Paragraph>
        <Typography.Paragraph type='Detail1'>Weight</Typography.Paragraph>
        <Typography.Paragraph type='Detail1'>Size</Typography.Paragraph>
        <Typography.Paragraph type='Detail1'>Line Height</Typography.Paragraph>
      </section>

      <section className='flexCol gap-[30px]'>
        {Object.entries(dict).map(([type, { Comp, weight, size, lineHeight }]) => (
          <section className='grid grid-cols-4' key={type}>
            <Comp type={type}>{type}</Comp>
            <Comp type={type}>{weight}</Comp>
            <Comp type={type}>{size}</Comp>
            <Comp type={type}>{lineHeight}</Comp>
          </section>
        ))}
      </section>
    </section>
  );
};

export const Variants = () => {
  const LONG_TEXT = `Looooooooooo ooooooooooo oooooooooooo ooooooooooooo ooooooooooo oooooooooo ooooooooooo oooooog`;
  const Desc: FC<PropsWithChildren<{ isDefault?: boolean }>> = ({ children, isDefault }) => (
    <Typography.Paragraph
      type='Detail1'
      className={cn(
        'relative w-fit rounded px-2 py-0.5 mb-2 border border-grey-300 text-white bg-grey-600 [&:not(:first-of-type)]:mt-3',
        isDefault &&
          `after:content-['Default'] after:absolute after:bg-red-800 after:right-[-60px] after:rounded after:px-1`
      )}
    >
      {children}
    </Typography.Paragraph>
  );

  return (
    <section className='flex gap-10 flex-wrap p-[15px]'>
      <section className='flex flex-col w-[400px] gap-[10px]'>
        <Typography.Title type='Title2'>{`<Typography.Title />`}</Typography.Title>

        <section className='flex flex-col rounded border p-4'>
          <Desc isDefault>{`ellipsis=true`}</Desc>
          <Typography.Title type='Title1'>{LONG_TEXT}</Typography.Title>

          <Desc>{`ellipsis=false`}</Desc>
          <Typography.Title type='Title1'>{LONG_TEXT}</Typography.Title>
        </section>
      </section>

      <section className='flex flex-col w-[400px] gap-[10px]'>
        <Typography.Title type='Title2'>{`<Typography.Typography />`}</Typography.Title>

        <section className='flex flex-col rounded border p-4'>
          <Desc isDefault>{`overflow="no-control"`}</Desc>
          <Typography.Paragraph type='Detail1'>{LONG_TEXT}</Typography.Paragraph>

          <Desc>{`overflow="ellipsis"`}</Desc>
          <Typography.Paragraph type='Detail1' overflow='ellipsis'>
            {LONG_TEXT}
          </Typography.Paragraph>

          <Desc>{`overflow="break-words"`}</Desc>
          <Typography.Paragraph type='Detail1' overflow='break-words'>
            {LONG_TEXT}
          </Typography.Paragraph>

          <Desc>{`overflow="break-all"`}</Desc>
          <Typography.Paragraph type='Detail1' overflow='break-all'>
            {LONG_TEXT}
          </Typography.Paragraph>
        </section>

        <section className='flex flex-col rounded border p-4'>
          <Desc isDefault>inline: false</Desc>
          <section>
            <Typography.Paragraph type='Detail1'>Content 1</Typography.Paragraph>
            <Typography.Paragraph type='Detail1'>Content 2</Typography.Paragraph>
          </section>

          <Desc>inline: true</Desc>
          <section>
            <Typography.Paragraph type='Detail1' inline>
              Content 1
            </Typography.Paragraph>
            <Typography.Paragraph type='Detail1' inline>
              Content 2
            </Typography.Paragraph>
          </section>
        </section>
      </section>
    </section>
  );
};
