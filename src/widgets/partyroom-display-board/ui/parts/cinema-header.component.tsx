'use client';
import { ReactNode } from 'react';
import Notice from './notice.component';

type Props = {
  sidebarActions?: ReactNode;
  headerActions?: ReactNode;
};

export default function CinemaHeader({ sidebarActions, headerActions }: Props) {
  return (
    <div className='flex items-center justify-between px-6 h-14'>
      <div className='flex items-center gap-4'>{sidebarActions}</div>
      <div className='flex-1 mx-6 max-w-[512px]'>
        <Notice />
      </div>
      <div className='flex items-center gap-3'>{headerActions}</div>
    </div>
  );
}
