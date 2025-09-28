import clsx from 'clsx';
import { Typography } from '@/shared/ui/components/typography';

type Props = {
  totalPages: number;
  currentPage: number;
};

export default function Paginator({ totalPages, currentPage }: Props) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className='flex  items-center space-x-0'>
      {pages.map((page, idx) => (
        <div key={page} className='flex items-center'>
          <div
            className={clsx(
              'w-[20px] h-[20px] flex items-center justify-center rounded-full',
              page === currentPage
                ? 'bg-gradient-red text-white'
                : 'border-[1px] border-gray-600 text-gray-600'
            )}
          >
            <Typography type='caption1'>{page}</Typography>
          </div>
          {idx < pages.length - 1 ? (
            currentPage === page ? (
              <div className='w-[28px] h-[1px] bg-gradient-red mx-1' />
            ) : (
              <div className='w-[28px] h-[1px] bg-gray-600 mx-1' />
            )
          ) : null}
        </div>
      ))}
    </div>
  );
}
