'use client';
import { useVerticalStretch } from '@/shared/lib/hooks/use-vertical-stretch.hook';
import Loading, { type LoadingProps } from './loading.component';

export default function LoadingPanel({ size = 24, ...rest }: LoadingProps) {
  const setRef = useVerticalStretch<HTMLDivElement>();

  return (
    <div ref={setRef} className='flexColCenter w-full p-[20px]'>
      <Loading size={size} {...rest} />
    </div>
  );
}
