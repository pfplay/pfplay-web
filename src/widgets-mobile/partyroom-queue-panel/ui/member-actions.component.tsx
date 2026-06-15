'use client';
import { FC } from 'react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';

interface Props {
  isMeInQueue: boolean;
  onRegister: () => void;
  onUnregister: () => void;
  onManagePlaylists: () => void;
}

const MemberActions: FC<Props> = ({ isMeInQueue, onRegister, onUnregister, onManagePlaylists }) => {
  const t = useI18n();
  return (
    <div className='shrink-0 flex flex-col gap-2 p-4 border-t border-gray-800'>
      <Button
        data-testid='member-action-manage-playlists'
        color='secondary'
        onClick={onManagePlaylists}
        className='w-full'
      >
        {t.partyroom.queue.member_action_manage_playlists}
      </Button>
      {isMeInQueue ? (
        <Button
          data-testid='member-action-unregister'
          color='secondary'
          variant='outline'
          onClick={onUnregister}
          className='w-full'
        >
          {t.partyroom.queue.member_action_unregister}
        </Button>
      ) : (
        <Button data-testid='member-action-register' onClick={onRegister} className='w-full'>
          {t.partyroom.queue.member_action_register}
        </Button>
      )}
    </div>
  );
};

export default MemberActions;
