import { AvatarEditDone, ProfileAvatarEditPanel } from '@/features/edit-profile-avatar';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { LineBreakProcessor } from '@/shared/lib/localization/renderer';
import { Trans } from '@/shared/lib/localization/renderer/index.ui';
import { Button } from '@/shared/ui/components/button';
import { useDialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';

export default function useOpenEditProfileAvatarDialog() {
  const t = useI18n();
  const { openDialog, openConfirmDialog } = useDialog();

  return () => {
    return openDialog((onOk, onCancel) => ({
      classNames: {
        container: 'w-[1680px] h-[800px] p-0 bg-gray-900',
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
          content: (
            <Trans i18nKey='party.para.stop_editing' processors={[new LineBreakProcessor()]} />
          ),
        });
      },
    }));
  };
}
