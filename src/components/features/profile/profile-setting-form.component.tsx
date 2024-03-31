'use client';

import { useSession } from 'next-auth/react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFetchProfile } from '@/api/react-query/user/use-fetch-profile.query';
import { useUpdateProfile } from '@/api/react-query/user/use-update-profile.mutation';
import Button from '@/components/shared/atoms/button.component';
import Input from '@/components/shared/atoms/input.component';
import TextArea from '@/components/shared/atoms/textarea.component';
import FormItem from '@/components/shared/form-item.component';
import { useAppRouter } from '@/components/shared/router/use-app-router.hook';
import { cn } from '@/utils/cn';

export const profileFormSchema = z.object({
  nickname: z
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

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfileSettingForm = () => {
  const router = useAppRouter();
  const { data: profile } = useFetchProfile();
  const { data: session, update } = useSession();

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors, isValid },
  } = useForm<ProfileFormValues>({
    mode: 'all',
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nickname: profile?.nickname,
      introduction: profile?.introduction,
    },
  });

  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const handleFormSubmit: SubmitHandler<ProfileFormValues> = ({ nickname, introduction }) => {
    updateProfile(
      {
        nickname,
        introduction,
        bodyId: 1, // FIXME
        faceUrl: 'url', // FIXME
      },
      {
        onSuccess: async () => {
          await update({
            ...session,
            user: {
              ...session?.user,
              profileUpdated: true,
            },
          });
          router.push('/settings/avatar');
        },
        onError: (err) => {
          // FIXME: 다른 브랜치에서 작업한 server response 를 제네릭으로 변경
          if (err.response?.data.code === 409) {
            setError('nickname', { message: '이미 사용중인 이름입니다.' });
          }
        },
      }
    );
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
          name='nickname'
          render={({ field }) => (
            <FormItem
              label='닉네임'
              error={errors.nickname?.message}
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
              error={errors.introduction?.message}
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
        loading={isPending}
      >
        Let&apos;s get in
      </Button>
    </form>
  );
};

export default ProfileSettingForm;
