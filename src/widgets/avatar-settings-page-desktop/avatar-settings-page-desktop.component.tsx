'use client';

import { useRouter } from 'next/navigation';
import { AvatarEditDone, ProfileAvatarEditPanel } from '@/features/edit-profile-avatar';
import { BackButton } from '@/shared/ui/components/back-button';
import { Button } from '@/shared/ui/components/button';
import { TooltipTrigger } from '@/shared/ui/components/tooltip';

/**
 * 데스크탑 아바타 편집 페이지 본문 (chunk 1 (lobby)/page.tsx 와 동일 RSC 변환 패턴).
 *
 * 기존 `src/app/settings/avatar/page.tsx` 의 'use client' 본문을 그대로 흡수.
 * page.tsx 는 `headers()` 로 device 분기 후 본 위젯을 데스크탑 케이스에서 렌더.
 */
const AvatarSettingsPageDesktop = () => {
  const router = useRouter();

  return (
    <div className='absolute-user-form-section'>
      <ProfileAvatarEditPanel
        titleRender={(text) => <BackButton text={text} />}
        actions={
          <AvatarEditDone
            onSuccess={() => {
              router.push('/parties');
            }}
          >
            {({ done, canSubmit, loading, submitHint }) => (
              <TooltipTrigger title={submitHint}>
                <Button
                  onClick={done}
                  disabled={!canSubmit}
                  loading={loading}
                  className='px-[88.5px]'
                  size='xl'
                >
                  Let&apos;s get in
                </Button>
              </TooltipTrigger>
            )}
          </AvatarEditDone>
        }
      />
    </div>
  );
};

export default AvatarSettingsPageDesktop;
