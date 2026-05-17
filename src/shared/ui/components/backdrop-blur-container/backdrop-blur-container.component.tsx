'use client';
import Image from 'next/image';
import { PropsWithChildren } from 'react';
import { cn } from '@/shared/lib/functions/cn';

interface BackdropBlurContainerProps {
  src?: string;
  alt?: string;
  className?: string;
}

const BackdropBlurContainer = ({
  src,
  alt,
  className,
  children,
}: PropsWithChildren<BackdropBlurContainerProps>) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden border border-gray-800 rounded cursor-pointer',
        className
      )}
    >
      <div className='absolute inset-1'>
        <Image
          priority
          src={src || '/images/ETC/PlaylistThumbnail.png'}
          alt={alt || 'backdrop image'}
          fill
          className='object-cover select-none scale-105'
        />
      </div>
      {children}
    </div>
  );
};

export default BackdropBlurContainer;
