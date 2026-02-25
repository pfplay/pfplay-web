import Image from 'next/image';
import { BoldProcessor, LineBreakProcessor } from '@/shared/lib/localization/renderer';
import { Trans } from '@/shared/lib/localization/renderer/index.ui';
import { Typography } from '@/shared/ui/components/typography';

export default function Guide3() {
  return (
    <div className='flex flex-col justify-center items-center'>
      <Image src='/images/ETC/DjingGuide3.png' alt='djing guide 3' width={500} height={189} />
      <Typography className='mt-[24px]'>
        <Trans
          i18nKey='dj.para.display_count'
          processors={[new BoldProcessor(), new LineBreakProcessor()]}
        />
      </Typography>
    </div>
  );
}
