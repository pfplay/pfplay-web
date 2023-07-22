'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import GoBackButton from '@/components/GoBackButton';
import InputErrorMessage from '@/components/form/InputErrorMessage';
import { cn } from '@/lib/utils';

const profileFormSchema = z.object({
  nickName: z
    .string()
    .min(1)
    .max(16)
    .refine((value) => !/[\s!@#$%^&*()_+{}\[\]:;<>,.?~\-]/g.test(value)),
  introduction: z.string().min(1).max(50, { message: '50자 제한' }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfileSettings = () => {
  const router = useRouter();

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

  const handleFormSubmit: SubmitHandler<ProfileFormValues> = (data) => {
    console.log({ data });
  };

  const isBtnDisabled = Object.keys(errors).length > 0 || !isValid;

  return (
    <section className='min-w-[1000px] bg-grey-10 flexCol justify-between items-center mx-auto pt-10 px-[60px]'>
      <div className='self-start'>
        <GoBackButton text='당신은 누구신가요?' onClick={() => router.back()} />
      </div>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className='w-full h-full flexCol justify-between items-center gap-20 pt-24 pb-12  text-grey-3 '
      >
        {/* nickname */}
        <div>
          <div className={'flex justify-between gap-10 mb-[77px]'}>
            <h3 className='text-lg'>
              닉네임<span className='text-red-2'>*</span>
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
                      className='w-full bg-grey-8 rounded px-4 py-[13px] placeholder:text-[15px]'
                    />
                    <p className='absolute right-4 top-1/2 transform -translate-y-1/2 text-grey-5'>
                      <span className={cn(errors.nickName && 'text-red-2')}>
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
          {/* introduction */}
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
                      className='w-full bg-grey-8 rounded pt-[13px] px-4'
                    />
                    <p className='absolute right-4 bottom-3 text-grey-5'>
                      <span className={cn(errors.introduction && 'text-red-2')}>
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
        <button
          type='submit'
          className={cn(
            'self-end bg-grey-9 text-grey-7 font-bold-sm px-[96px] py-[12px]',
            !isBtnDisabled && 'bg-gradient-red text-grey-1'
          )}
          disabled={isBtnDisabled}
        >
          Let&apos;s get in
        </button>
      </form>
    </section>
  );
};

export default ProfileSettings;
