'use client';
import Image from 'next/image';
import { PropsWithChildren } from 'react';
import { cn } from '@/shared/lib/functions/cn';

interface BackdropBlurContainerProps {
  src?: string;
  className?: string;
  fallbackSrc?: string;
  imageClassName?: string;
}

const BackdropBlurContainer = ({
  src,
  className,
  fallbackSrc,
  imageClassName,
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
          src={src || fallbackSrc || '/images/ETC/PlaylistThumbnail.png'}
          alt={'backdrop image'}
          fill
          className={cn('object-cover select-none scale-105', imageClassName)}
        />
      </div>
      {children}
    </div>
  );
};

export default BackdropBlurContainer;
