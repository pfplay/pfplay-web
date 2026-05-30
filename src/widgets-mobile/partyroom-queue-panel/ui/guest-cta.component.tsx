'use client';
import { FC } from 'react';
import { useInformSocialType } from '@/features/sign-in/by-social';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Typography } from '@/shared/ui/components/typography';

/**
 * 게스트가 DJ 대기열 탭에서 sign-up 으로 진입하는 CTA.
 *
 * **회귀 fix (#383)**: 기존 `router.push('/sign-in')` 은 페이지 이동이라 룸 unmount + backend exit 발생.
 * 데스크탑 `features/partyroom/create/ui/card.component.tsx` 와 동일하게 `useInformSocialType()` (sign-in dialog)
 * 패턴으로 변경 — dialog 가 룸 위에 떠서 사용자가 로그인 완료해도 룸은 유지.
 */
const GuestCta: FC = () => {
  const t = useI18n();
  const informSocialType = useInformSocialType();
  return (
    <button
      type='button'
      data-testid='guest-cta'
      onClick={() => informSocialType()}
      className='shrink-0 m-4 p-4 border border-gray-700 rounded text-center hover:bg-gray-900'
    >
      <Typography type='body3'>{t.partyroom.queue.guest_cta_title}</Typography>
      <Typography type='detail1' className='text-primary-300 mt-2'>
        {t.partyroom.queue.guest_cta_subtitle}
      </Typography>
    </button>
  );
};

export default GuestCta;
