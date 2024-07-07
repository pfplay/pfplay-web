'use client';
import { JSX, forwardRef, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/lib/functions/cn';

export type TypographyType =
  | 'title1'
  | 'title2'
  | 'body1'
  | 'body2'
  | 'body3'
  | 'body4'
  | 'detail1'
  | 'detail2'
  | 'caption1'
  | 'caption2';
type TypographyOverflow = 'ellipsis' | 'break-words' | 'break-all' | 'break-normal' | 'break-keep';

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  type?: TypographyType;
  overflow?: TypographyOverflow;
  as?: keyof Pick<JSX.IntrinsicElements, 'h1' | 'h2' | 'p' | 'span'>;
}

const Typography = forwardRef<HTMLParagraphElement, TypographyProps>(
  (
    {
      className,
      children,
      type = 'detail1',
      overflow = titleTypes.includes(type) ? 'ellipsis' : undefined,
      title = overflow === 'ellipsis' && typeof children === 'string' ? children : undefined,
      as: El = defaultElDict[type],
      ...rest
    },
    ref
  ) => {
    return (
      <El
        ref={ref}
        title={title}
        className={cn([typoStyleDict[type], overflow && overflowDict[overflow], className])}
        {...rest}
      >
        {children}
      </El>
    );
  }
);

const defaultElDict: Record<TypographyType, keyof Pick<JSX.IntrinsicElements, 'h1' | 'h2' | 'p'>> =
  {
    title1: 'h1',
    title2: 'h2',
    body1: 'p',
    body2: 'p',
    body3: 'p',
    body4: 'p',
    detail1: 'p',
    detail2: 'p',
    caption1: 'p',
    caption2: 'p',
  };
const titleTypes: TypographyType[] = ['title1', 'title2'];

export const typoStyleDict: Record<TypographyType, string> = {
  title1: 'text-[28px] font-bold leading-[1.3]',
  title2: 'text-[24px] font-bold leading-[1.3]',
  body1: 'text-[20px] font-bold leading-[1.5]',
  body2: 'text-[18px] font-bold leading-[1.5]',
  body3: 'text-[16px] font-bold leading-[1.5]',
  body4: 'text-[10px] font-bold leading-[1.5]',
  detail1: 'text-[16px] font-normal leading-[1.5]',
  detail2: 'text-[14px] font-semibold leading-[1.5]',
  caption1: 'text-[14px] font-normal leading-[1.5]',
  caption2: 'text-[12px] font-normal leading-[1.5]',
};
const overflowDict: Record<TypographyOverflow, string> = {
  ellipsis: 'truncate',
  'break-words': 'break-words',
  'break-all': 'break-all',
  'break-normal': 'break-normal',
  'break-keep': 'break-keep',
};

export default Typography;
