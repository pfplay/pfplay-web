import { useI18n } from '@/shared/lib/localization/i18n.context';
import { renderBr } from '@/shared/lib/localization/split-render';
import { Button } from '@/shared/ui/components/button';
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

        <Button
          color='secondary'
          variant='outline'
          Icon={<PFClose width={24} height={24} />}
          className='border-none p-0'
          onClick={onCancel}
        />
      </header>

      <div className='h-[388px] flexRowCenter'>
        <div className='flexColCenter gap-[24px]'>
          <Typography type='body2' className='text-center'>
            {renderBr(t.dj.para.no_dj_crew)}
          </Typography>

          <RegisterButton />
        </div>
      </div>
    </>
  );
}
