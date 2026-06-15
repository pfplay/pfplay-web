'use client';

import { Typography } from '@/shared/ui/components/typography';

/**
 * 모바일 진입자가 빈 페이지를 보지 않게 표시하는 임시 카드.
 *
 * Chunk 1 시점엔 모바일 페이지 본문이 아직 없음 → 본 카드를 노출.
 * Chunk 2~4 에 모바일 페이지가 실제로 채워지면 page.tsx 의 분기가 이 카드를 거치지 않음.
 * Chunk 5 catch-up 에서 본 컴포넌트 + /mobile-notice 라우트 함께 삭제.
 *
 * NOTE: chunk 5 까지의 transitional 컴포넌트라 i18n 키 없이 한국어 하드코딩.
 */
export const MobileFallbackCard = () => {
  return (
    <main className='min-h-screen flex items-center justify-center px-6 py-10 bg-black'>
      <div className='max-w-md w-full text-center space-y-4'>
        <Typography type='title2' className='text-white'>
          모바일 버전 준비 중
        </Typography>
        <Typography type='body1' className='text-gray-300'>
          이 페이지의 모바일 버전은 곧 출시됩니다.
          <br />
          데스크탑 브라우저로 접속하시면 모든 기능을 이용하실 수 있습니다.
        </Typography>
      </div>
    </main>
  );
};
