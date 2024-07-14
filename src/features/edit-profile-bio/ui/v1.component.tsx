'use client';

import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSuspenseFetchMe } from '@/entities/me';
import { cn } from '@/shared/lib/functions/cn';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { FormItem } from '@/shared/ui/components/form-item';
import { Input } from '@/shared/ui/components/input';
import { TextArea } from '@/shared/ui/components/textarea';
import { useUpdateMyBio } from '../api/use-update-my-bio.mutation';
import * as Form from '../model/form.model';

const ProfileEditFormV1 = () => {
  const t = useI18n();
  const { data: me } = useSuspenseFetchMe();
  const { mutate: updateBio, isPending } = useUpdateMyBio();

  const {
    handleSubmit,
    control,
    setError,
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

  const handleFormSubmit: SubmitHandler<Form.Model> = (values) => {
    updateBio(values, {
      // onSuccess 시 어디로 이동할지는, 사용부에서 me 변경따른 effect로 처리
      onError: (err) => {
        // FIXME: 다른 브랜치에서 작업한 server response 를 제네릭으로 변경
        if (err.response?.data.code === 409) {
          setError('nickname', { message: 'This nickname is already used.' }); // TODO: i18n
        }
      },
    });
  };

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
              label={t.settings.title.nickname}
              error={errors.nickname?.message}
              required
              classNames={{ label: 'text-gray-200' }}
            >
              {/* 한글 8자, 영문 16자 제한/띄어쓰기, 특수문자 사용 불가' */}
              <Input
                {...field}
                maxLength={16}
                placeholder={t.common.ec.char_limit_12}
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
              label={t.settings.title.introduction}
              error={errors.introduction?.message}
              classNames={{ label: 'text-gray-200' }}
            >
              <TextArea
                {...field}
                maxLength={50}
                rows={3}
                placeholder={t.common.ec.char_limit_50}
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

export default ProfileEditFormV1;
