'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import GoBackButton from '@/components/__legacy__/GoBackButton';
import InputErrorMessage from '@/components/__legacy__/InputErrorMessage';
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

const ProfileSettings = () => {
  const router = useRouter();

  const setProfile = useProfileStore((state) => state.setProfile);

  const {
    handleSubmit,
    watch,
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
    router.push(ROUTES.AVATAR.settings);
  };

  const btnDisabled = Object.keys(errors).length > 0 || !isValid;

  return (
    <section className='min-w-[1000px] bg-gray-900 flexCol justify-between items-center mx-auto pt-10 px-[60px]'>
      <GoBackButton text='당신은 누구신가요?' className='self-start' />
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className='w-full h-full flexCol justify-between items-center gap-20 pt-24 pb-12  text-gray-200 '
      >
        <div>
          <div className={'flex justify-between gap-10 mb-[77px]'}>
            <h3 className='text-lg'>
              닉네임<span className='text-red-300'>*</span>
            </h3>
            <div className='w-[536px] flexCol'>
              <Controller
                control={control}
                name='nickName'
                render={({ field }) => (
                  <div className='relative'>
                    <input
                      {...field}
                      maxLength={16}
                      placeholder='한글 8자, 영문 16자 제한/띄어쓰기, 특수문자 사용 불가'
                      className='w-full bg-gray-700 rounded px-4 py-[13px] placeholder:text-[15px]'
                    />
                    <p className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400'>
                      <span className={cn(errors.nickName && 'text-red-300')}>
                        {watch('nickName') ? watch('nickName').length : 0}
                      </span>
                      /16
                    </p>
                  </div>
                )}
              />
              {errors.nickName && (
                <InputErrorMessage errorMessage='한글 8자, 영문 16자 제한/띄어쓰기, 특수문자 사용 불가' />
              )}
            </div>
          </div>
          <div className='flex justify-between'>
            <h3 className='text-lg'>소개</h3>
            <div className='w-[536px] flexCol'>
              <Controller
                control={control}
                name='introduction'
                render={({ field }) => (
                  <div className='relative'>
                    <textarea
                      {...field}
                      maxLength={50}
                      rows={3}
                      placeholder='한/영 구분 없이 띄어쓰기 포함 50자 제한'
                      className='w-full bg-gray-700 rounded pt-[13px] px-4'
                    />
                    <p className='absolute right-4 bottom-3 text-gray-400'>
                      <span className={cn(errors.introduction && 'text-red-300')}>
                        {watch('introduction') ? watch('introduction').length : 0}
                      </span>
                      /50
                    </p>
                  </div>
                )}
              />
              {errors.introduction && (
                <InputErrorMessage errorMessage='한/영 구분 없이 띄어쓰기 포함 50자 제한' />
              )}
            </div>
          </div>
        </div>
        {/* TODO: Button 컴포넌트 수정되면 대체 */}
        <button
          type='submit'
          className={cn(
            'self-end bg-gray-800 text-gray-600 font-bold-sm px-[96px] py-[12px]',
            !btnDisabled && 'bg-gradient-red text-gray-50'
          )}
          disabled={btnDisabled}
        >
          Let&apos;s get in
        </button>
      </form>
    </section>
  );
};

export default ProfileSettings;
