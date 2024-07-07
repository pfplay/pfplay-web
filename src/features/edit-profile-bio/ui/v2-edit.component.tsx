'use client';

import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Avatar } from '@/entities/avatar';
import { useSuspenseFetchMe } from '@/entities/me';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { FormItemError } from '@/shared/ui/components/form-item';
import { Input } from '@/shared/ui/components/input';
import { TextArea } from '@/shared/ui/components/textarea';
import { useUpdateMyBio } from '../api/use-update-my-bio.mutaion';
import * as Form from '../model/form.model';

type V2EditModeProps = {
  changeToViewMode: () => void;
};

const V2EditMode = ({ changeToViewMode }: V2EditModeProps) => {
  const t = useI18n();
  const { data: me } = useSuspenseFetchMe();
  const { mutate: updateBio, isPending } = useUpdateMyBio();

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isValid },
  } = useForm<Form.Model>({
    mode: 'all',
    resolver: zodResolver(Form.getSchema(t)),
    defaultValues: {
      nickname: me.nickname,
      introduction: me.introduction,
    },
  });
  const btnDisabled = Object.keys(errors).length > 0 || !isValid;

  const onSubmit: SubmitHandler<Form.Model> = (values) => {
    updateBio(values, {
      onSuccess: changeToViewMode,
    });
  };

  const handleCancelEdit = () => {
    changeToViewMode();
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='gap-5 flexRow'>
        <div className='w-max h-[216px] flexRowCenter bg-[#1D1D1D] pointer-events-none select-none'>
          {!!me.avatarBodyUri && (
            <Avatar
              height={180}
              bodyUri={me.avatarBodyUri}
              faceUri={me.avatarFaceUri}
              facePosX={me.combinePositionX}
              facePosY={me.combinePositionY}
            />
          )}
        </div>
        <div className='justify-between flex-1 flexCol'>
          <div className='items-start gap-3 flexCol'>
            <div className='flex flex-col gap-1'>
              <Input
                {...register('nickname')}
                maxLength={16}
                placeholder={t.common.ec.char_limit_12}
              />

              {errors.nickname && <FormItemError>{errors.nickname?.message}</FormItemError>}
            </div>
            <div className='flex flex-col gap-1 w-full'>
              <TextArea
                {...register('introduction')}
                classNames={{
                  container: 'h-[158px]', // FIXME: 야매 고정높이
                }}
                maxLength={50}
                placeholder={t.common.ec.char_limit_50}
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
