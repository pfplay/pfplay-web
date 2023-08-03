'use client';
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const titleVariants = cva(['font-bold leading-[1.3]'], {
  variants: {
    type: {
      title1: ['text-[28px]'],
      title2: ['text-[24px]'],
    },
    ellipsis: {
      true: 'truncate',
      false: null,
    },
  },
  defaultVariants: {
    type: 'title1',
    ellipsis: true,
  },
});
const paragraphVariants = cva(['leading-[1.5]'], {
  variants: {
    type: {
      body1: ['text-[20px] font-bold'],
      body2: ['text-[18px] font-bold'],
      body3: ['text-[16px] font-bold'],
      detail1: ['text-[16px] font-normal'],
      detail2: ['text-[14px] font-semibold'],
      caption1: ['text-[14px] font-normal'],
      caption2: ['text-[12px] font-normal'],
    },
    overflow: {
      'no-control': '',
      ellipsis: 'truncate',
      'break-words': 'break-words',
      'break-all': 'break-all',
    },
    inline: {
      true: 'inline-block',
      false: null,
    },
  },
  defaultVariants: {
    type: 'detail1',
    overflow: 'no-control',
    inline: false,
  },
});

type TitleEl = keyof Pick<JSX.IntrinsicElements, 'h1' | 'h2'>;
type TitleVariantProps = VariantProps<typeof titleVariants>;
export type TitleType = NonNullable<TitleVariantProps['type']>;
type ParagraphEl = keyof Pick<JSX.IntrinsicElements, 'p'>;
type ParagraphVariantProps = VariantProps<typeof paragraphVariants>;
export type ParagraphType = NonNullable<ParagraphVariantProps['type']>;
export interface TitleProps extends React.ComponentProps<TitleEl>, TitleVariantProps {}
export interface ParagraphProps extends React.ComponentProps<ParagraphEl>, ParagraphVariantProps {}

const titleElDict: Record<TitleType, TitleEl> = {
  title1: 'h1',
  title2: 'h2',
};
const Title = ({
  className,
  children,
  type,
  ellipsis,
  title,
  ...props
}: React.PropsWithChildren<TitleProps>) => {
  const El = titleElDict[type || 'title1'];

  return (
    <El
      title={title ?? (ellipsis && typeof children === 'string' ? children : undefined)}
      className={cn(titleVariants({ type, ellipsis, className }))}
      {...props}
    >
      {children}
    </El>
  );
};

const Paragraph = ({
  className,
  children,
  type,
  overflow,
  title,
  inline,
  ...props
}: React.PropsWithChildren<ParagraphProps>) => {
  return (
    <p
      title={
        title ?? (overflow === 'ellipsis' && typeof children === 'string' ? children : undefined)
      }
      className={cn(paragraphVariants({ type, overflow, className, inline }))}
      {...props}
    >
      {children}
    </p>
  );
};

const Typography = { Title, Paragraph };
export default Typography;
