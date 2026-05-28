import { FC } from 'react';

/**
 * 큐 탭 placeholder (chunk 4 wiring 까지).
 * spec §3.3 chunk 2↔3 "곧 출시" 카드 패턴.
 */
const QueueTabPlaceholder: FC = () => {
  return (
    <div className='flex flex-col items-center justify-center h-full text-center px-6 gap-2'>
      <span className='text-3xl' aria-hidden='true'>
        🎧
      </span>
      <p className='text-sm text-gray-400'>곧 큐잉 기능을 만나보세요</p>
      <p className='text-xs text-gray-600'>지금은 데스크탑에서 사용할 수 있어요</p>
    </div>
  );
};

export default QueueTabPlaceholder;
