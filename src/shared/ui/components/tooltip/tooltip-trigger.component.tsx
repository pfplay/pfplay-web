'use client';

import { PropsWithChildren, useState } from 'react';
import Tooltip from './tooltip.component';

type Props = PropsWithChildren<{
  title?: string;
  color?: 'red' | 'gray';
  spacing?: number;
  className?: string;
}>;

export default function TooltipTrigger({
  title,
  color = 'red',
  spacing,
  className,
  children,
}: Props) {
  const [visible, setVisible] = useState(false);

  if (!title) {
    return <>{children}</>;
  }

  return (
    <Tooltip title={title} visible={visible} color={color} spacing={spacing}>
      <span
        className={className ?? 'inline-flex max-w-full'}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      >
        {children}
      </span>
    </Tooltip>
  );
}
