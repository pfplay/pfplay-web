'use client';
import { AvatarEditDone, ProfileAvatarEditPanel } from '@/features/edit-profile-avatar';
import { BackButton } from '@/shared/ui/components/back-button';
import { Button } from '@/shared/ui/components/button';

export default function AvatarSettingsPage() {
  return (
    <div className='absolute-user-form-section'>
      <ProfileAvatarEditPanel
        titleRender={(text) => <BackButton text={text} />}
        actions={
          <AvatarEditDone>
            {({ done, canSubmit, loading }) => (
              <Button
                onClick={done}
                disabled={!canSubmit}
                loading={loading}
                className='px-[88.5px]'
                size='xl'
              >
                Let&apos;s get in
              </Button>
            )}
          </AvatarEditDone>
        }
      />
    </div>
  );
}
