import { useForm } from 'react-hook-form';
import { UseFormReturn } from 'react-hook-form/dist/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSuspenseFetchMe } from '@/entities/me';
import { cn } from '@/shared/lib/functions/cn';
import { Language } from '@/shared/lib/localization/constants';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useLang } from '@/shared/lib/localization/lang.context';
import { Button } from '@/shared/ui/components/button';
import { DjListItem } from '@/shared/ui/components/dj-list-item';
import { FormItem } from '@/shared/ui/components/form-item';
import { Input } from '@/shared/ui/components/input';
import { InputNumber } from '@/shared/ui/components/input-number';
import { TextArea } from '@/shared/ui/components/textarea';
import { Tooltip } from '@/shared/ui/components/tooltip';
import { Typography } from '@/shared/ui/components/typography';
import * as Form from '../model/form.model';

export type PartyroomMutationSubmitHandler = (
  values: Form.Model,
  formInstance: UseFormReturn<Form.Model>
) => void;

type Props = {
  onSubmit: PartyroomMutationSubmitHandler;
  defaultValues?: Form.Model;
};

export default function PartyroomMutationForm({ defaultValues, onSubmit }: Props) {
  const t = useI18n();
  const lang = useLang();
  const { data: me } = useSuspenseFetchMe();

  const form = useForm<Form.Model>({
    mode: 'all',
    resolver: zodResolver(Form.getSchema(t)),
    defaultValues: {
      limit: DEFAULT_LIMIT, // FIXME: placeholder로 표기하고, 값이 비어있을 경우 submit 핸들러에서 DEFAULT_LIMIT을 넣어주도록 수정 - zod schema에서 number에 대해 "비어있거나 3이상일 때 valid" 라는 조건을 설정하는 법을 모르겠음
      ...defaultValues,
    },
  });
  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
  } = form;

  const btnDisabled = Object.keys(errors).length > 0 || !isValid;

  return (
    <form
      onSubmit={handleSubmit(() => onSubmit(form.getValues(), form))}
      className={cn('flexCol items-center justify-between mx-auto pl-[26px] pr-[40px]', {
        'child-form-labels:w-[100px]': lang === Language.Ko,
        'child-form-labels:w-[120px]': lang === Language.En,
      })}
    >
      <div className='w-full items-end gap-12 flexCol'>
        <FormItem
          label={t.party.title.party_name}
          error={errors.name?.message}
          required
          classNames={{ label: 'text-gray-200', container: 'w-full' }}
        >
          <Input
            {...register('name')}
            maxLength={Form.MAX_LENGTH.NAME}
            placeholder={t.common.ec.char_limit_12}
          />
        </FormItem>

        <FormItem
          label={t.party.title.party_desc}
          required
          error={errors.introduce?.message}
          classNames={{ label: 'text-gray-200', container: 'w-full' }}
        >
          <TextArea
            {...register('introduce')}
            maxLength={Form.MAX_LENGTH.INTRODUCE}
            rows={3}
            placeholder={t.common.ec.char_limit_50}
          />
        </FormItem>

        <div className='w-full flexRow items-center justify-between gap-8'>
          <FormItem
            label={
              <Typography as='span' type='body2' className='text-left'>
                {t.db.title.domain}
                <Typography as='span' type='detail2'>
                  {t.createparty.para.select}
                </Typography>
              </Typography>
            }
            error={errors.domain?.message}
            classNames={{ label: 'text-gray-200', container: 'flex-1' }}
          >
            <Input
              {...register('domain')}
              placeholder='웹 페이지 주소는 pfplay.io/도메인으로 시작' // TODO: i18n
            />
          </FormItem>

          <div className='flexRow items-center gap-4'>
            <div>
              <FormItem
                fit
                required
                label={
                  <Tooltip
                    title={t.createparty.para.noti_djing_limit}
                    visible={!!errors.limit?.message}
                  >
                    <Typography type='body2'>
                      {/* TODO: i18n - 문구 줄바꿈 적용 필요*/}
                      {t.db.title.dj_time_limit}
                    </Typography>
                  </Tooltip>
                }
                classNames={{
                  label: cn('text-gray-200', {
                    '!w-[75px]': lang === Language.Ko,
                    '!w-[100px]': lang === Language.En,
                  }),
                }}
              >
                <InputNumber {...register('limit', { valueAsNumber: true })} />
                <Typography as='span' type='detail1' className='text-gray-200 ml-[8px]'>
                  {t.createparty.para.min}
                </Typography>
              </FormItem>
            </div>
          </div>
        </div>
        <div className='w-full flexRow justify-between items-center'>
          <FormItem
            label={
              <Typography as='span' type='body2'>
                Admin
              </Typography>
            }
            classNames={{ label: 'text-gray-200' }}
          >
            <DjListItem userConfig={{ username: me.nickname, src: me.avatarIconUri }} />
          </FormItem>

          <Button
            type='submit'
            variant='fill'
            size='lg'
            className='px-[74px]'
            disabled={btnDisabled}
          >
            {t.createparty.btn.create_party}
          </Button>
        </div>
      </div>
    </form>
  );
}

const DEFAULT_LIMIT = 7;
