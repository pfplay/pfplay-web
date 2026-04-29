import { useI18n } from '@/shared/lib/localization/i18n.context';
import { LineBreakProcessor } from '@/shared/lib/localization/renderer';
import { Trans } from '@/shared/lib/localization/renderer/index.ui';
import { TextButton } from '@/shared/ui/components/text-button';
import { Typography } from '@/shared/ui/components/typography';
import { PFClose } from '@/shared/ui/icons';
import RegisterButton from './register-button.component';

export default function EmptyBody({ onCancel }: { onCancel: () => void | undefined }) {
  const t = useI18n();

  return (
    <>
      <header className='flex justify-between items-center h-[48px] pt-[12px]'>
        <Typography type='title2' className='text-start'>
          {t.dj.title.current_dj}
        </Typography>

        <TextButton
          data-testid='djing-dialog-close'
          onClick={onCancel}
          Icon={<PFClose width={24} height={24} />}
        />
      </header>

      <div className='h-[388px] flexRowCenter'>
        <div className='flexColCenter gap-[24px]'>
          <Typography type='body2' className='text-center'>
            <Trans i18nKey='dj.para.no_dj_crew' processors={[new LineBreakProcessor()]} />
          </Typography>

          <RegisterButton />
        </div>
      </div>
    </>
  );
}
