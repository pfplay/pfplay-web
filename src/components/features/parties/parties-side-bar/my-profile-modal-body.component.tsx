'use client';

import Image from 'next/image';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFetchProfile } from '@/api/react-query/user/use-fetch-profile.query';
import { useUpdateProfile } from '@/api/react-query/user/use-update-profile.mutation';
import {
  profileFormSchema,
  ProfileFormValues,
} from '@/components/features/profile/profile-setting-form.component';
import Button from '@/components/shared/atoms/button.component';
import Input from '@/components/shared/atoms/input.component';
import TextArea from '@/components/shared/atoms/textarea.component';
import Typography from '@/components/shared/atoms/typography.component';
import { FormItemError } from '@/components/shared/form-item.component';
import { PFEdit } from '@/components/shared/icons';
import { useAppRouter } from '@/components/shared/router/use-app-router.hook';

type MyProfileModalBodyProps = {
  onAvatarSettingClick?: () => void;
};
const MyProfileModalBody = ({ onAvatarSettingClick }: MyProfileModalBodyProps) => {
  const router = useAppRouter();
  const { data: profile } = useFetchProfile();

  const [profileEditMode, setProfileEditMode] = useState(false);

  const { mutate, isPending } = useUpdateProfile();

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isValid },
  } = useForm<ProfileFormValues>({
    mode: 'all',
    resolver: zodResolver(profileFormSchema),
    defaultValues: { ...profile },
  });

  const onSubmit: SubmitHandler<ProfileFormValues> = (values) => {
    mutate(values, {
      onSuccess: () => {
        setProfileEditMode(false);
      },
    });
  };

  const handleClickEditButton = () => {
    setProfileEditMode(true);
  };

  const handleClickAvatarEditButton = () => {
    router.push('/settings/avatar');
    onAvatarSettingClick?.();
  };

  const handleCancelEdit = () => {
    setProfileEditMode(false);
    reset();
  };

  const btnDisabled = Object.keys(errors).length > 0 || !isValid;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='gap-5 flexRow'>
        <div className='flexCol gap-9'>
          <div className='w-[108px] bg-[#1D1D1D] pointer-events-none select-none'>
            <Image
              src={'/images/Background/avatar.png'}
              alt={'profilePicture'}
              width={108}
              height={216}
            />
          </div>

          {!profileEditMode && (
            <Button size='sm' variant='outline' onClick={handleClickAvatarEditButton}>
              아바타 설정
            </Button>
          )}
        </div>
        <div className='justify-between flex-1 flexCol'>
          <div className='items-start gap-3 flexCol'>
            {profileEditMode ? (
              <>
                <div className='flex flex-col gap-1'>
                  <Input
                    {...register('nickname')}
                    maxLength={16}
                    placeholder='한글 8자, 영문 16자 제한/띄어쓰기, 특수문자 사용 불가'
                  />

                  {errors.nickname && <FormItemError>{errors.nickname?.message}</FormItemError>}
                </div>
                <div className='flex flex-col gap-1 w-full'>
                  <TextArea
                    {...register('introduction')}
                    maxLength={50}
                    rows={3}
                    placeholder='한/영 구분 없이 띄어쓰기 포함 50자 제한'
                  />
                  {errors.introduction?.message && (
                    <FormItemError>{errors.introduction?.message}</FormItemError>
                  )}
                </div>
                <div className='flex gap-2 justify-end w-full'>
                  <Button color='secondary' type='button' onClick={handleCancelEdit}>
                    취소
                  </Button>
                  <Button type='submit' loading={isPending} disabled={btnDisabled}>
                    저장
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className='flex gap-3 items-center'>
                  <Typography type='body1' className='text-white'>
                    {profile?.nickname}
                  </Typography>
                  <div onClick={() => handleClickEditButton()} className='cursor-pointer'>
                    <PFEdit />
                  </div>
                </div>
                <Typography className='text-left text-white'>{profile?.introduction}</Typography>
              </>
            )}
          </div>

          {!profileEditMode && (
            <div className='items-center justify-between flexRow'>
              <div className='gap-10 flexRow'>
                <Typography type='detail1' className='items-center gap-2 text-gray-200 flexRow'>
                  포인트
                  {/* FIXME:<p> cannot appear as a descendant of <p>. */}
                  <Typography as='span' type='body3'>
                    76p
                  </Typography>
                </Typography>
                <Typography type='detail1' className='items-center gap-2 text-gray-200 flexRow'>
                  가입일
                  <Typography as='span' type='body3'>
                    76p
                  </Typography>
                </Typography>
              </div>
              <Image
                src={'/images/ETC/rainbow.png'}
                alt='rainbow'
                width={32}
                height={32}
                className='select-none pointer-events-none'
              />
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

export default MyProfileModalBody;
