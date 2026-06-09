'use client';

import { Controller } from 'react-hook-form';
import { useEditProfileBioForm } from '@/features/edit-profile-bio';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { FormItem } from '@/shared/ui/components/form-item';
import { Input } from '@/shared/ui/components/input';
import { TextArea } from '@/shared/ui/components/textarea';

/**
 * 모바일 강제 프로필 온보딩 폼. 데스크탑 `ProfileEditFormV1` 과 동일한
 * `useEditProfileBioForm` 로직을 공유하고, 레이아웃만 모바일 폼팩터
 * (full-width 필드 + 하단 full-width CTA)로 다르다.
 */
const MobileProfileEditForm = () => {
  const t = useI18n();
  const { control, onSubmit, errors, btnDisabled, isPending } = useEditProfileBioForm();

  return (
    <form
      data-testid='mobile-profile-form'
      onSubmit={onSubmit}
      className='flexCol gap-10 w-full px-app pt-6 pb-10'
    >
      <div className='flexCol gap-8 w-full'>
        <Controller
          control={control}
          name='nickname'
          render={({ field }) => (
            <FormItem
              label={t.settings.title.nickname}
              error={errors.nickname?.message}
              required
              classNames={{ label: 'text-gray-200' }}
            >
              <Input
                {...field}
                maxLength={16}
                placeholder={t.common.ec.char_limit_12}
                classNames={{ container: 'w-full' }}
              />
            </FormItem>
          )}
        />
        <Controller
          control={control}
          name='introduction'
          render={({ field }) => (
            <FormItem
              label={t.settings.title.introduction}
              error={errors.introduction?.message}
              classNames={{ label: 'text-gray-200' }}
            >
              <TextArea
                {...field}
                maxLength={50}
                rows={3}
                placeholder={t.common.ec.char_limit_50}
                classNames={{ container: 'w-full' }}
              />
            </FormItem>
          )}
        />
      </div>

      <Button
        type='submit'
        data-testid='mobile-profile-submit'
        variant={btnDisabled ? 'outline' : 'fill'}
        size='xl'
        className='w-full'
        disabled={btnDisabled}
        loading={isPending}
      >
        Let&apos;s get in
      </Button>
    </form>
  );
};

export default MobileProfileEditForm;
