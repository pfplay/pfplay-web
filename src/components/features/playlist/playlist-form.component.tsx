import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/shared/atoms/input.component';
import Dialog from '@/components/shared/dialog.component';
import FormItem from '@/components/shared/form-item.component';

const PlaylistFormSchema = z.object({
  name: z.string().min(1, { message: '1자 이상 입력해주세요' }).max(20, { message: '20자 제한' }),
});

export type PlaylistFormType = z.infer<typeof PlaylistFormSchema>;

export type PlaylistFormProps = {
  onCancel?: () => void;
  onSubmit: (values: PlaylistFormType) => void;
  defaultValues?: Partial<PlaylistFormType>;
};
const PlaylistForm = ({ defaultValues, onCancel, onSubmit }: PlaylistFormProps) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<PlaylistFormType>({ resolver: zodResolver(PlaylistFormSchema), defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormItem label='' layout='vertical' error={errors.name?.message}>
        <Input
          {...register('name')}
          placeholder='한/영 구분없이 띄어쓰기 포함 20자 제한'
          maxLength={20}
        />
      </FormItem>
      <Dialog.ButtonGroup>
        <Dialog.Button type='button' color='secondary' onClick={onCancel}>
          취소
        </Dialog.Button>
        <Dialog.Button type='submit'>추가하기</Dialog.Button>
      </Dialog.ButtonGroup>
    </form>
  );
};

export default PlaylistForm;
