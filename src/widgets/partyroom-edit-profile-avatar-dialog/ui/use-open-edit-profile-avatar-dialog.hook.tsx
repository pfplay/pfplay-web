import { AvatarEditDone, ProfileAvatarEditPanel } from '@/features/edit-profile-avatar';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { renderBr } from '@/shared/lib/localization/split-render';
import { Button } from '@/shared/ui/components/button';
import { useDialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';

export default function useOpenEditProfileAvatarDialog() {
  const t = useI18n();
  const { openDialog, openConfirmDialog } = useDialog();

  return () => {
    return openDialog((onOk, onCancel) => ({
      classNames: {
        container: 'w-[1680px]',
      },
      Body: (
        <ProfileAvatarEditPanel
          titleRender={(text) => <Typography type='title2'>{text}</Typography>}
          actions={
            <>
              <Button
                size='lg'
                color='secondary'
                onClick={onCancel}
                className='w-[200px] max-w-full'
              >
                {t.common.btn.cancel}
              </Button>
              <AvatarEditDone onSuccess={onOk}>
                {({ done, canSubmit, loading }) => (
                  <Button
                    size='lg'
                    onClick={done}
                    disabled={!canSubmit}
                    loading={loading}
                    className='w-[200px] max-w-full'
                  >
                    {t.common.btn.save}
                  </Button>
                )}
              </AvatarEditDone>
            </>
          }
        />
      ),
      closeConfirm: () => {
        return openConfirmDialog({
          content: renderBr(t.party.para.stop_editing),
        });
      },
    }));
  };
}
