'use client';
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { RecursiveExcludeNull } from '@/types';

type TypographyVariantProps = RecursiveExcludeNull<VariantProps<typeof typographyVariants>>;
export type TypographyType = NonNullable<TypographyVariantProps['type']>;
export interface TypographyProps extends React.ComponentProps<'p'>, TypographyVariantProps {}

const typographyVariants = cva([], {
  variants: {
    type: {
      title1: ['text-[28px] font-bold leading-[1.3]'],
      title2: ['text-[24px] font-bold leading-[1.3]'],
      body1: ['text-[20px] font-bold leading-[1.5]'],
      body2: ['text-[18px] font-bold leading-[1.5]'],
      body3: ['text-[16px] font-bold leading-[1.5]'],
      detail1: ['text-[16px] font-normal leading-[1.5]'],
      detail2: ['text-[14px] font-semibold leading-[1.5]'],
      caption1: ['text-[14px] font-normal leading-[1.5]'],
      caption2: ['text-[12px] font-normal leading-[1.5]'],
    },
    overflow: {
      ellipsis: 'truncate',
      'break-words': 'break-words',
      'break-all': 'break-all',
    },
    inline: {
      true: 'inline-block',
    },
  },
});

const elDict: Record<TypographyType, keyof Pick<JSX.IntrinsicElements, 'h1' | 'h2' | 'p'>> = {
  title1: 'h1',
  title2: 'h2',
  body1: 'p',
  body2: 'p',
  body3: 'p',
  detail1: 'p',
  detail2: 'p',
  caption1: 'p',
  caption2: 'p',
};
const titleTypes: TypographyType[] = ['title1', 'title2'];

const Typography = ({
  className,
  children,
  type = 'detail1',
  overflow = titleTypes.includes(type) ? 'ellipsis' : undefined,
  title = overflow === 'ellipsis' && typeof children === 'string' ? children : undefined,
  inline,
  ...props
}: React.PropsWithChildren<TypographyProps>) => {
  const El = elDict[type];

  return (
    <El
      title={title}
      className={cn(typographyVariants({ type, overflow, className, inline }))}
      {...props}
    >
      {children}
    </El>
  );
};

export default Typography;
