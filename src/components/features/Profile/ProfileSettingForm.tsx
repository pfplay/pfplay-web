'use client';
import { useRouter } from 'next/navigation';

import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FormItem from '@/components/shared/FormItem';
import Button from '@/components/shared/atoms/Button';
import Input from '@/components/shared/atoms/Input';
import TextArea from '@/components/shared/atoms/TextArea';
import { useProfileStore } from '@/store/profile';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/utils/routes';

const profileFormSchema = z.object({
  nickName: z
    .string()
    .min(1, { message: '1자 이상 입력해주세요' })
    .max(16, { message: '16자 제한' })
    .refine((value) => /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]*$/.test(value), {
      message: '한/영/숫자만 가능하고 띄어쓰기 및 특수문자 사용 불가',
    }),
  introduction: z
    .string()
    .min(1, { message: '1자 이상 입력해주세요' })
    .max(50, { message: '50자 제한' }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfileSettingForm = () => {
  const router = useRouter();

  const setProfile = useProfileStore((state) => state.setProfile);

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<ProfileFormValues>({
    mode: 'all',
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nickName: '',
      introduction: '',
    },
  });

  const handleFormSubmit: SubmitHandler<ProfileFormValues> = ({ nickName, introduction }) => {
    setProfile({ nickName, introduction });
    router.push(ROUTES.SETTINGS.AVATAR.index);
  };

  const btnDisabled = Object.keys(errors).length > 0 || !isValid;

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className='items-center justify-between py-24 flexCol'
    >
      <div className='items-end gap-12 flexCol'>
        <Controller
          control={control}
          name='nickName'
          render={({ field }) => (
            <FormItem
              label='닉네임'
              error={errors.nickName && '한글 8자, 영문 16자 제한/띄어쓰기, 특수문자 사용 불가'}
              required
              classNames={{ label: 'text-gray-200' }}
            >
              {/* 한글 8자, 영문 16자 제한/띄어쓰기, 특수문자 사용 불가' */}
              <Input
                {...field}
                maxLength={16}
                placeholder='한글 8자, 영문 16자 제한/띄어쓰기, 특수문자 사용 불가'
                classNames={{
                  container: 'w-[550px]',
                }}
              />
            </FormItem>
          )}
        />
        <Controller
          control={control}
          name='introduction'
          render={({ field }) => (
            <FormItem
              label='소개'
              error={errors.introduction && '한/영 구분 없이 띄어쓰기 포함 50자 제한'}
              classNames={{ label: 'text-gray-200' }}
            >
              <TextArea
                {...field}
                maxLength={50}
                rows={3}
                placeholder='한/영 구분 없이 띄어쓰기 포함 50자 제한'
                classNames={{
                  container: 'w-[550px]',
                }}
              />
            </FormItem>
          )}
        />
      </div>

      <Button
        type='submit'
        variant={btnDisabled ? 'outline' : 'fill'} // FIXME: true/false에 따라 variant가 바뀌어야 하는 것인지 디자이너와 협의 필요
        size='xl'
        className={cn('absolute bottom-10 right-[60px] px-[88px]')}
        disabled={btnDisabled}
      >
        Let&apos;s get in
      </Button>
    </form>
  );
};

export default ProfileSettingForm;