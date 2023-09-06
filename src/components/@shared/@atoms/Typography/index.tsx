'use client';
import React, { forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { titleTypes, elDict, typoStyleDict, overflowDict } from './Typography.config';
import { TypographyOverflow } from './Typography.types';
import { TypographyType } from '../Typography';

interface TypographyProps extends React.ComponentProps<'p'> {
  children?: ReactNode;
  type?: TypographyType;
  overflow?: TypographyOverflow;
  inline?: boolean;
}

const Typography = forwardRef<HTMLParagraphElement, TypographyProps>(
  (
    {
      className,
      children,
      type = 'detail1',
      overflow = titleTypes.includes(type) ? 'ellipsis' : undefined,
      title = overflow === 'ellipsis' && typeof children === 'string' ? children : undefined,
      inline,
      ...rest
    },
    ref
  ) => {
    const El = elDict[type];

    return (
      <El
        ref={ref}
        title={title}
        className={cn([
          typoStyleDict[type],
          overflow && overflowDict[overflow],
          inline && 'inline-block',

          className,
        ])}
        {...rest}
      >
        {children}
      </El>
    );
  }
);

export default Typography;
