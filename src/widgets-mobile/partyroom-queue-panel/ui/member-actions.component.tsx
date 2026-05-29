'use client';
import { FC } from 'react';
import { Button } from '@/shared/ui/components/button';

interface Props {
  isMeInQueue: boolean;
  onRegister: () => void;
  onUnregister: () => void;
}

const MemberActions: FC<Props> = ({ isMeInQueue, onRegister, onUnregister }) => (
  <div className='shrink-0 p-4 border-t border-gray-800'>
    {isMeInQueue ? (
      <Button
        data-testid='member-action-unregister'
        color='secondary'
        variant='outline'
        onClick={onUnregister}
        className='w-full'
      >
        큐에서 나가기
      </Button>
    ) : (
      <Button data-testid='member-action-register' onClick={onRegister} className='w-full'>
        + DJ 등록
      </Button>
    )}
  </div>
);

export default MemberActions;
