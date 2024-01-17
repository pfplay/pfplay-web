'use client';

import { useSession } from 'next-auth/react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { z } from 'zod';
import { UserProfile } from '@/api/@types/User';
import { UserService } from '@/api/services/User';
import FormItem from '@/components/shared/FormItem';
import { useAppRouter } from '@/components/shared/Router/useAppRouter';
import Button from '@/components/shared/atoms/Button';
import Input from '@/components/shared/atoms/Input';
import TextArea from '@/components/shared/atoms/TextArea';
import { cn } from '@/utils/cn';

// FIXME: 아래 query / mutation 은 다른 폴더로 이동 ===================
export const PROFILE_QUERY_KEY = 'PROFILE';
export const useProfileQuery = () => {
  const session = useSession();
  return useQuery({
    queryKey: [PROFILE_QUERY_KEY],
    queryFn: () => UserService.getProfile(),
    gcTime: Infinity,
    staleTime: Infinity,
    enabled: !!session,
  });
};

export const useInvalidateProfileQuery = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY] });
};

export const useProfileUpdateMutation = () => {
  const invalidateProfileQuery = useInvalidateProfileQuery();
  return useMutation({
    mutationFn: (data: UserProfile) => UserService.updateProfile(data),
    onSuccess: () => {
      invalidateProfileQuery();
    },
  });
};

// FIXME: 위 query / mutation 은 다른 폴더로 이동 ===================

const profileFormSchema = z.object({
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

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfileSettingForm = () => {
  const router = useAppRouter();

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors, isValid },
  } = useForm<ProfileFormValues>({
    mode: 'all',
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nickname: '',
      introduction: '',
    },
  });

  const { mutate: updateProfile, isPending } = useProfileUpdateMutation();

  const handleFormSubmit: SubmitHandler<ProfileFormValues> = ({ nickname, introduction }) => {
    updateProfile(
      {
        nickname,
        introduction,
      },
      {
        onSuccess: () => {
          router.push('/settings/avatar');
        },
        onError: (err) => {
          // FIXME: 다른 브랜치에서 작업한 server response 를 제네릭으로 변경
          if (isAxiosError<{ data: { code: number } }>(err)) {
            if (err.response?.data.data.code === 409) {
              setError('nickname', { message: '이미 사용중인 이름입니다.' });
            }
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
