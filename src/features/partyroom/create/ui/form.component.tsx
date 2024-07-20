'use client';
import { useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { useSuspenseFetchMe } from '@/entities/me';
import PartiesService from '@/shared/api/http/services/parties';
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

interface PartyroomCreateFormProps {
  onModalClose?: () => void;
}

const PartyroomCreateForm = ({ onModalClose }: PartyroomCreateFormProps) => {
  const t = useI18n();
  const lang = useLang();
  const { data: me } = useSuspenseFetchMe();
  const router = useRouter();

  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
    setError,
  } = useForm<Form.Model>({
    mode: 'all',
    resolver: zodResolver(Form.getSchema(t)),
    defaultValues: {
      name: '',
      introduce: '', // FIXME: BE가 attribute name 수정 하면 수정 필요
      domain: '',
      limit: 7,
    },
  });

  const btnDisabled = Object.keys(errors).length > 0 || !isValid;

  const handleFormSubmit: SubmitHandler<Form.Model> = async ({
    name,
    introduce,
    limit,
    domain,
  }) => {
    try {
      const response = await PartiesService.create({
        name,
        introduce,
        limit,
        domain: domain || undefined,
      });

      onModalClose && onModalClose();

      router.push(`/parties/${domain || response.name}`);
    } catch (error: unknown) {
      // FIXME: BE와 api 논의 후 수정 필요. 1. 유저가 이미 파티를 개설한 경우 2. 도메인이 이미 존재하는 경우
      if (error instanceof AxiosError && error.response?.status === 409) {
        setError('domain', { message: t.createparty.para.domain_in_use });
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={cn('flexCol items-center justify-between mx-auto pl-[26px] pr-[40px]', {
        'child-form-labels:w-[100px]': lang === Language.Ko,
        'child-form-labels:w-[120px]': lang === Language.En,
      })}
    >
      <div className=' w-full items-end gap-12 flexCol'>
        <FormItem
          label={t.party.title.party_name}
          error={errors.name?.message}
          required
          classNames={{ label: 'text-gray-200', container: 'w-full' }}
        >
          <Input {...register('name')} placeholder={t.common.ec.char_limit_12} maxLength={30} />
        </FormItem>

        <FormItem
          label={t.party.title.party_desc}
          required
          error={errors.introduce && t.common.ec.char_limit_50}
          classNames={{ label: 'text-gray-200', container: 'w-full' }}
        >
          <TextArea
            {...register('introduce')}
            maxLength={50}
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
                      {/* TODO: 문구 줄바꿈 적용 필요*/}
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
                <InputNumber {...register('limit', { valueAsNumber: true })} initialValue={7} />
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
            <DjListItem userConfig={{ username: me.nickname, src: '' }} />
          </FormItem>

          <Button
            type='submit'
            variant={'fill'}
            size='lg'
            className={'px-[74px]'}
            disabled={btnDisabled}
          >
            {t.createparty.btn.create_party}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PartyroomCreateForm;
