'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import GoBackButton from '@/components/GoBackButton';
import InputErrorMessage from '@/components/form/InputErrorMessage';
import { cn } from '@/lib/utils';

const profileFormSchema = z.object({
  nickName: z
    .string()
    .max(16)
    .refine((value) => !/[\s!@#$%^&*()_+{}\[\]:;<>,.?~\-]/g.test(value)),
  introduction: z.string().max(50, '50자 제한'),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfileSettings = () => {
  // const [isProfileSet, setIsProfileSet] = useState(false);
  const [nickNameLetterCount, setNickNameLetterCount] = useState(0);
  const [introductionLetterCount, setIntroductionLetterCount] = useState(0);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    mode: 'onChange',
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nickName: '',
      introduction: '',
    },
  });

  const handleFormSubmit: SubmitHandler<ProfileFormValues> = (data) => {
    console.log(data);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const currentTarget = e.currentTarget.name as keyof ProfileFormValues;

    if (currentTarget === 'nickName') {
      setNickNameLetterCount(e.target.value.length);
    }

    if (currentTarget === 'introduction') {
      setIntroductionLetterCount(e.target.value.length);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-w-[1200px] bg-grey-10 flexCol justify-between items-center pt-10 pb-12 px-[60px] text-grey-3 gap-14'
    >
      <div className='self-start'>
        <GoBackButton text='당신은 누구신가요?' onClick={() => router.back()} />
      </div>
      <section>
        {/* nickname */}
        <article className={'flex justify-between gap-10 mb-[77px]'}>
          <h3 className='text-lg'>
            닉네임<span className='text-red-2'>*</span>
          </h3>
          <div className=' w-[536px] flex flex-col'>
            <div className='relative'>
              <input
                maxLength={16}
                {...register('nickName')}
                placeholder='한글 8자, 영문 16자 제한/띄어쓰기, 특수문자 사용 불가'
                onChange={(e) => handleInputChange(e)}
                className='w-full bg-grey-8 rounded px-4 py-[13px] placeholder:text-[15px]'
              />
              <p className='absolute right-4 top-1/2 transform -translate-y-1/2 text-grey-5'>
                <span className={cn(errors.nickName?.message && 'text-red-2')}>
                  {nickNameLetterCount}
                </span>
                /16
              </p>
            </div>
            {errors.nickName?.message && (
              <InputErrorMessage errorMessage='한글 8자, 영문 16자 제한/띄어쓰기, 특수문자 사용 불가' />
            )}
          </div>
        </article>
        {/* introduction */}
        <article className='flex justify-between'>
          <h3 className='text-lg'>소개</h3>
          <div className='relative w-[536px] flex flex-col'>
            <textarea
              maxLength={50}
              rows={3}
              className='w-full bg-grey-8 rounded pt-[13px] px-4'
              {...register('introduction')}
              placeholder='한/영 구분 없이 띄어쓰기 포함 50자 제한'
              onChange={(e) => handleInputChange(e)}
            />
            <p className='absolute right-4 bottom-3 text-grey-5'>
              <span className={cn(errors.introduction?.message && 'text-red-2')}>
                {introductionLetterCount}
              </span>
              /50
            </p>
            {errors.introduction?.message && (
              <InputErrorMessage errorMessage=' 한/영 구분 없이 띄어쓰기 포함 50자 제한' />
            )}
          </div>
        </article>
      </section>

      <button className='self-end bg-[#1C1C1C] text-[#434343] font-bold-sm px-[96px] py-[12px]'>
        Let&apos;s get in
      </button>
    </form>
  );
};

export default ProfileSettings;
