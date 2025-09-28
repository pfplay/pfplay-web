import Image from 'next/image';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { BoldProcessor, LineBreakProcessor, Trans } from '@/shared/lib/localization/renderer';
import { Typography } from '@/shared/ui/components/typography';

export default function Guide1() {
  const t = useI18n();
  return (
    <div className='flex flex-col justify-center items-center'>
      <Typography className='mb-[8px] text-gray-300'>{t.dj.title.dj_queue}</Typography>
      <Image src='/images/ETC/DjingGuide1.png' alt='djing guide 1' width={320} height={160} />
      <Typography className='mt-[24px]'>
        <Trans
          i18nKey='dj.para.dj_in_order'
          processors={[new BoldProcessor(), new LineBreakProcessor()]}
        />
      </Typography>
    </div>
  );
}
