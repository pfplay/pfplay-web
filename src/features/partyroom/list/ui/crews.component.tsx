import Image from 'next/image';
import { cn } from '@/shared/lib/functions/cn';
import { Typography } from '@/shared/ui/components/typography';
import { PFPersonFilled } from '@/shared/ui/icons';

type Props = {
  count: number;
  icons: string[];
};

const Crews = ({ count, icons }: Props) => {
  return (
    <div className='flexRowCenter gap-[45px]'>
      <div className='flexRowCenter gap-[6px]'>
        <PFPersonFilled width={18} height={18} />
        <Typography type='body3' className='text-gray-50'>
          {count ? count : 0}
        </Typography>
      </div>
      <ul className='flexRowCenter gap-2'>
        {icons?.slice(0, 3).map((icon, i) => (
          <li key={i} className='w-6 h-6 rounded-full bg-slate-400'>
            <Image
              priority
              src={icon}
              alt={'party crew'}
              width={24}
              height={24}
              className={cn('w-full h-full object-contain select-none')}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Crews;
