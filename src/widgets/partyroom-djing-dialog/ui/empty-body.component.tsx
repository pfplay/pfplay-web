import { useRegisterDjWithTrack } from '@/features/partyroom/register-dj-with-track';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { LineBreakProcessor } from '@/shared/lib/localization/renderer';
import { Trans } from '@/shared/lib/localization/renderer/index.ui';
import { Button } from '@/shared/ui/components/button';
import { TextButton } from '@/shared/ui/components/text-button';
import { Typography } from '@/shared/ui/components/typography';
import { PFAddPlaylist, PFClose, PFSearch } from '@/shared/ui/icons';
import RegisterButton from './register-button.component';
import { usePartyroomId } from '../lib/partyroom-id.context';

export default function EmptyBody({ onCancel }: { onCancel: () => void | undefined }) {
  const t = useI18n();
  const partyroomId = usePartyroomId();
  const registerDjWithTrack = useRegisterDjWithTrack();

  return (
    <>
      <header className='flex justify-between items-center'>
        <Typography type='title2' className='text-start'>
          {t.dj.title.current_dj}
        </Typography>

        <TextButton
          data-testid='djing-dialog-close'
          onClick={onCancel}
          Icon={<PFClose width={24} height={24} />}
        />
      </header>

      <Typography type='body2' className='my-[40px] text-center text-gray-300'>
        <Trans i18nKey='dj.para.no_dj_crew' processors={[new LineBreakProcessor()]} />
      </Typography>

      <div className='flexCol gap-[12px]'>
        <Button
          size='xl'
          className='w-full'
          Icon={<PFSearch />}
          onClick={() => registerDjWithTrack({ partyroomId, closeDjingDialog: onCancel })}
          data-testid='search-and-register-dj'
        >
          {t.dj.btn.search_and_register_dj}
        </Button>

        <RegisterButton
          size='xl'
          color='secondary'
          className='w-full'
          Icon={<PFAddPlaylist />}
          label={t.dj.btn.pick_from_my_playlist}
        />
      </div>
    </>
  );
}
