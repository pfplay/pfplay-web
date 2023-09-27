import Link from 'next/link';
import React from 'react';
import { cn } from '@/utils/cn';
import Typography from './@atoms/Typography';

interface CustomLinkProps {
  linkTitle: string;
  href: string;
  className?: string;
  disabled?: boolean;
}

const CustomLink = ({ href, linkTitle, className, disabled }: CustomLinkProps) => {
  return (
    <Link
      href={href}
      className={cn(
        'flexRowCenter rounded h-[56px] bg-gradient-red',
        disabled && 'bg-transparent border border-gray-700 select-none pointer-events-none',
        className
      )}
    >
      <Typography className={cn('text-gray-50', disabled && ' text-gray-600')} type='body1'>
        {linkTitle}
      </Typography>
    </Link>
  );
};

export default CustomLink;
