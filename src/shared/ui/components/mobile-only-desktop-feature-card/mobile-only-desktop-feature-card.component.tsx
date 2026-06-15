'use client';

import Link from 'next/link';
import { FC } from 'react';

export type MobileOnlyDesktopFeature =
  | 'avatar-edit'
  | 'room-create'
  | 'moderation'
  | 'bug-report'
  | 'withdraw';

const featureLabel: Record<MobileOnlyDesktopFeature, string> = {
  'avatar-edit': '아바타 편집',
  'room-create': '룸 생성',
  moderation: '모더레이션',
  'bug-report': '버그 리포트',
  withdraw: '회원 탈퇴',
};

interface Props {
  feature: MobileOnlyDesktopFeature;
}

/**
 * 모바일 진입 시 데스크탑 전용 기능 안내 카드 (스펙 §2.4).
 *
 * 기존 데스크탑 UI 를 모바일 viewport 로 옮길 ROI 가 낮은 기능 (편집·모더레이션 등)
 * 에 대해, 데스크탑 진입 안내로 대체. 모바일 진입 funnel 의 dead-end 회피.
 */
const MobileOnlyDesktopFeatureCard: FC<Props> = ({ feature }) => {
  return (
    <main className='min-h-screen flex items-center justify-center px-6 py-10 bg-black'>
      <div className='max-w-md w-full text-center space-y-5'>
        <div className='text-5xl'>🖥️</div>
        <h1 className='text-xl font-bold text-white'>
          {featureLabel[feature]} 은 데스크탑에서 사용 가능합니다
        </h1>
        <p className='text-sm text-gray-400'>
          데스크탑 브라우저로 접속하시면 이 기능을 이용하실 수 있습니다.
        </p>
        <Link
          href='/parties'
          className='inline-block px-6 py-3 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors'
        >
          ← 파티 찾기로 돌아가기
        </Link>
      </div>
    </main>
  );
};

export default MobileOnlyDesktopFeatureCard;
