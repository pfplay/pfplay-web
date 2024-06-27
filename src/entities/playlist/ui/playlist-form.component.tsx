import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useI18n } from '@/shared/lib/localization/i18n.context';
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
  const t = useI18n();
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
          placeholder={t.common.ec.char_limit_20}
          maxLength={20}
          autoComplete='off'
        />
      </FormItem>
      <Dialog.ButtonGroup>
        <Dialog.Button type='button' color='secondary' onClick={onCancel}>
          {t.common.btn.cancel}
        </Dialog.Button>
        <Dialog.Button type='submit'>{t.common.btn.add}</Dialog.Button>
      </Dialog.ButtonGroup>
    </form>
  );
};

export default Form;
