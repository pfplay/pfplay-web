'use client';

import { useId } from 'react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { Typography } from '@/shared/ui/components/typography';
import usePushSubscription from '../lib/use-push-subscription';

/**
 * 공지 푸시 알림 토글.
 * 상태 판정은 `usePushSubscription` 훅이 담당하고, 이 컴포넌트는 상태별 뷰만 그린다.
 *  - unsupported : 아무것도 렌더하지 않음(섹션 숨김)
 *  - needs-install / denied : 안내 문구 + 비활성 컨트롤
 *  - pending : 로딩 + 비활성 컨트롤
 *  - off / on : 클릭 시 enable / disable
 */
const NotificationToggle = () => {
  const t = useI18n();
  const { status, enable, disable } = usePushSubscription();
  const labelId = useId();

  if (status === 'unsupported') return null;

  const strings = t.settings.notifications;

  const isOn = status === 'on';
  const isPending = status === 'pending';
  const isBlocked = status === 'needs-install' || status === 'denied';
  const disabled = isBlocked || isPending;

  const hint =
    status === 'needs-install'
      ? strings.needs_install_hint
      : status === 'denied'
        ? strings.denied_hint
        : null;

  return (
    <section className='flexCol gap-3 w-full' aria-labelledby={labelId}>
      <div className='flex items-start justify-between gap-4'>
        <div className='flexCol gap-1'>
          <Typography id={labelId} type='body3' className='text-white'>
            {strings.toggle_label}
          </Typography>
          <Typography type='detail1' className='text-gray-400'>
            {strings.description}
          </Typography>
        </div>

        <Button
          type='button'
          size='sm'
          color={isOn ? 'primary' : 'secondary'}
          variant={isOn ? 'fill' : 'outline'}
          role='switch'
          aria-checked={isOn}
          aria-labelledby={labelId}
          loading={isPending}
          disabled={disabled}
          onClick={() => (isOn ? disable() : enable())}
        >
          {isOn ? 'ON' : 'OFF'}
        </Button>
      </div>

      {hint && (
        <Typography type='detail1' className='text-red-300'>
          {hint}
        </Typography>
      )}
    </section>
  );
};

export default NotificationToggle;
