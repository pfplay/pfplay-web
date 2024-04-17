'use client';
import Image from 'next/image';
import { PropsWithChildren } from 'react';
import { cn } from '@/shared/lib/cn';

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
    <div className={cn('relative border border-gray-800 rounded cursor-pointer', className)}>
      <div className='absolute inset-1'>
        {/* FIXME: replace the image according to api spec */}
        <Image
          priority
          src={src || '/images/ETC/PlaylistThumbnail.png'}
          alt={alt || 'backdrop image'}
          width={80}
          height={40}
          className='object-fill w-full h-full p-2 select-none'
        />
      </div>
      {children}
    </div>
  );
};

export default BackdropBlurContainer;
