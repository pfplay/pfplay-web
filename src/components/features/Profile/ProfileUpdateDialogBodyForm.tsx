'use cient';

import React from 'react';

import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Dialog from '@/components/shared/Dialog';
import { FormItemError } from '@/components/shared/FormItem';
import Input from '@/components/shared/atoms/Input';
import TextArea from '@/components/shared/atoms/TextArea';
import {
  ProfileFormValues,
  profileFormSchema,
  useProfileQuery,
  useProfileUpdateMutation,
} from './ProfileSettingForm';

type ProfileUpdateDialogBodyFormProps = {
  onCancel?: () => void;
  onSuccess?: () => void;
};

const ProfileUpdateDialogBodyForm = ({ onCancel, onSuccess }: ProfileUpdateDialogBodyFormProps) => {
  const { mutate, isPending } = useProfileUpdateMutation();
  const { data: profile } = useProfileQuery();

  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
  } = useForm<ProfileFormValues>({
    mode: 'all',
    resolver: zodResolver(profileFormSchema),
    defaultValues: { ...profile },
  });

  const onSubmit: SubmitHandler<ProfileFormValues> = (values) => {
    mutate(values, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  };

  const btnDisabled = Object.keys(errors).length > 0 || !isValid;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='flex flex-col gap-8'>
        <div className='flex flex-col gap-1'>
          <Input
            {...register('nickname')}
            maxLength={16}
            placeholder='한글 8자, 영문 16자 제한/띄어쓰기, 특수문자 사용 불가'
          />

          {errors.nickname && <FormItemError>{errors.nickname?.message}</FormItemError>}
        </div>

        <div className='flex flex-col gap-1'>
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
      </div>

      <Dialog.ButtonGroup>
        <Dialog.Button type='button' color='secondary' onClick={onCancel}>
          취소
        </Dialog.Button>
        <Dialog.Button type='submit' loading={isPending} disabled={btnDisabled}>
          확인
        </Dialog.Button>
      </Dialog.ButtonGroup>
    </form>
  );
};

export default ProfileUpdateDialogBodyForm;
