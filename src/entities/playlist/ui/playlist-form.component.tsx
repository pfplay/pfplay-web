import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@/shared/ui/components/dialog';
import { FormItem } from '@/shared/ui/components/form-item';
import { Input } from '@/shared/ui/components/input';
import * as PlaylistForm from '../model/playlist-form.model';

export type FormProps = {
  onCancel?: () => void;
  onSubmit: (values: PlaylistForm.Model) => void;
  defaultValues?: Partial<PlaylistForm.Model>;
};

const Form = ({ defaultValues, onCancel, onSubmit }: FormProps) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<PlaylistForm.Model>({ resolver: zodResolver(PlaylistForm.schema), defaultValues });

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

export default Form;
