'use client';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import GoBackButton from '@/components/GoBackButton';

const profileFormSchema = z.object({
  nickname: z.string(),
  introduction: z.string(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfileEdit = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nickname: '',
      introduction: '',
    },
  });

  const nicknameError = errors.nickname;
  const introductionError = errors.introduction;

  const handleFormSubmit = (data: ProfileFormValues) => {
    console.log(data);
  };

  return (
    <>
      <div onClick={() => router.back()}>
        <GoBackButton title='당신은 누구신가요?' />
      </div>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className='w-[650px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
      >
        {/* nickname */}
        <div className={`flex justify-between ${!nicknameError && 'mb-[76px]'}`}>
          <p className='text-white'>닉네임*</p>
          <div className='flex flex-col'>
            <input
              className='w-[536px] border border-solid border-[#2F2F2F] bg-[#2F2F2F] rounded h-12 px-2 placeholder:text-xs'
              {...register('nickname')}
              placeholder='한글 8자, 영문 16자 제한/띄어쓰기, 특수문자 사용 불가'
            />
            {nicknameError ? (
              <span role='alert' className={'text-red-500 text-xs mb-[52px] mt-[8px]'}>
                {errors?.nickname?.message ??
                  '한글 8자, 영문 16자 제한/띄어쓰기, 특수문자 사용 불가'}
              </span>
            ) : (
              <div className='mb-[0px]' />
            )}
          </div>
        </div>
        {/* introduction */}
        <div className='flex justify-between'>
          <p className='text-white'>소개</p>
          <div className='flex flex-col'>
            <textarea
              className='w-[536px] border border-solid border-[#2F2F2F] bg-[#2F2F2F] rounded h-12 pt-2 px-2'
              {...register('introduction')}
              placeholder='한/영 구분 없이 띄어쓰기 포함 50자 제한'
            />
            {introductionError ? (
              <span role='alert' className={'text-red-500 text-xs mt-[8px]'}>
                {errors?.introduction?.message ??
                  '한글 8자, 영문 16자 제한/띄어쓰기, 특수문자 사용 불가'}
              </span>
            ) : (
              <div className='mb-[0px]' />
            )}
          </div>
        </div>
      </form>
      <button
        onClick={handleSubmit(() => router.push('/avatar/edit'))}
        className='absolute bottom-[48px] right-[60px] bg-[#1C1C1C] text-[#434343] font-bold-sm px-[96px] py-[12px]'
      >
        Let&apos;s get in
      </button>
    </>
  );
};

export default ProfileEdit;
