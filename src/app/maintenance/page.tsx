import { Metadata } from 'next';
import { Typography } from '@/shared/ui/components/typography';
import RefreshButton from './refresh-button';

export const metadata: Metadata = {
  title: 'PFPlay - 시스템 점검 중',
};

const MaintenancePage = () => {
  return (
    <div className='flex flex-col items-center gap-5 max-w-[480px] text-center px-6'>
      <div className='w-[80px] h-[80px] bg-gradient-red rounded-full flexColCenter'>
        <span className='text-[36px]'>🔧</span>
      </div>

      <Typography type='title1' className='text-gray-50'>
        시스템 점검 중
      </Typography>

      <Typography type='detail1' className='text-gray-400 whitespace-pre-line'>
        {
          '더 나은 서비스를 위해 시스템 점검을 진행하고 있습니다.\n점검이 완료되면 정상적으로 이용하실 수 있습니다.'
        }
      </Typography>

      <div className='w-[48px] h-[2px] bg-gray-700 my-1' />

      <RefreshButton />

      <Typography type='caption1' className='text-gray-700 font-extrabold mt-5'>
        PFPlay
      </Typography>
    </div>
  );
};

export default MaintenancePage;
