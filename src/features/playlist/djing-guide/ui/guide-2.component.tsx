import Image from 'next/image';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { BoldProcessor, LineBreakProcessor } from '@/shared/lib/localization/renderer';
import { Trans } from '@/shared/lib/localization/renderer/index.ui';
import { Typography } from '@/shared/ui/components/typography';

export default function Guide2() {
  const t = useI18n();
  return (
    <div className='flex flex-col justify-center items-center'>
      <Typography className='mb-[8px] text-gray-300'>{t.playlist.title.my_playlist}</Typography>
      <Image src='/images/ETC/DjingGuide2.png' alt='djing guide 2' width={440} height={160} />
      <Typography className='mt-[24px]'>
        <Trans
          i18nKey='dj.para.played_sequentially'
          processors={[new BoldProcessor(), new LineBreakProcessor()]}
        />
      </Typography>
    </div>
  );
}
