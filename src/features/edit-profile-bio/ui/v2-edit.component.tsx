'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFetchMe } from '@/entities/me';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { FormItemError } from '@/shared/ui/components/form-item';
import { Input } from '@/shared/ui/components/input';
import { TextArea } from '@/shared/ui/components/textarea';
import { useUpdateMyBio } from '../api/use-update-my-bio.mutaion';
import * as ProfileForm from '../model/form.model';

type V2EditModeProps = {
  changeToViewMode: () => void;
};

const V2EditMode = ({ changeToViewMode }: V2EditModeProps) => {
  const t = useI18n();
  const { data: me } = useFetchMe();
  const { mutate: updateBio, isPending } = useUpdateMyBio();

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isValid },
  } = useForm<ProfileForm.Model>({
    mode: 'all',
    resolver: zodResolver(ProfileForm.schema),
  });
  const btnDisabled = Object.keys(errors).length > 0 || !isValid;

  const onSubmit: SubmitHandler<ProfileForm.Model> = (values) => {
    updateBio(values, {
      onSuccess: changeToViewMode,
    });
  };

  const handleCancelEdit = () => {
    changeToViewMode();
    reset();
  };

  useEffect(() => {
    if (me) {
      reset({
        nickname: me.nickname,
        introduction: me.introduction,
      });
    }
  }, [me]);

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
        </div>
        <div className='justify-between flex-1 flexCol'>
          <div className='items-start gap-3 flexCol'>
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
                {t.common.btn.cancel}
              </Button>
              <Button type='submit' loading={isPending} disabled={btnDisabled}>
                {t.common.btn.save}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default V2EditMode;
