'use client';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { PartiesService } from '@/shared/api/services/parties';
import { Button } from '@/shared/ui/components/button';
import { FormItem } from '@/shared/ui/components/form-item';
import { Input } from '@/shared/ui/components/input';
import { InputNumber } from '@/shared/ui/components/input-number';
import { TextArea } from '@/shared/ui/components/textarea';
import { Tooltip } from '@/shared/ui/components/tooltip';
import { Typography } from '@/shared/ui/components/typography';
import DjListItem from './dj-list-item.component';
import * as Form from '../model/form.model';

interface PartyroomCreateFormProps {
  onModalClose?: () => void;
}

const PartyroomCreateForm = ({ onModalClose }: PartyroomCreateFormProps) => {
  const { data } = useSession();
  const router = useRouter();

  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
    setError,
  } = useForm<Form.Model>({
    mode: 'all',
    resolver: zodResolver(Form.schema),
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
        setError('domain', { message: '이미 존재하는 도메인 주소입니다' });
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className='flexCol items-center justify-between mx-auto child-form-labels:w-[100px] pl-[26px] pr-[40px]'
    >
      <div className=' w-full items-end gap-12 flexCol'>
        <FormItem
          label='파티이름'
          error={errors.name?.message}
          required
          classNames={{ label: 'text-gray-200', container: 'w-full' }}
        >
          <Input
            {...register('name')}
            placeholder='한글 8자, 영문 16자 제한/띄어쓰기, 특수문자 사용 불가'
            maxLength={30}
          />
        </FormItem>

        <FormItem
          label='파티 소개'
          required
          error={errors.introduce && '한/영 구분 없이 띄어쓰기 포함 50자 제한'}
          classNames={{ label: 'text-gray-200', container: 'w-full' }}
        >
          <TextArea
            {...register('introduce')}
            maxLength={50}
            rows={3}
            placeholder='한/영 구분 없이 띄어쓰기 포함 50자 제한'
          />
        </FormItem>

        <div className='w-full flexRow items-center justify-between gap-8'>
          <FormItem
            label={
              <Typography as='span' type='body2' className='text-left'>
                도메인
                <Typography as='span' type='detail2'>
                  (선택)
                </Typography>
              </Typography>
            }
            error={errors.domain?.message}
            classNames={{ label: 'text-gray-200', container: 'flex-1' }}
          >
            <Input
              {...register('domain')}
              placeholder='웹 페이지 주소는 pfplay.io/도메인으로 시작'
            />
          </FormItem>

          <div className='flexRow items-center gap-4'>
            <div>
              <FormItem
                fit
                label={
                  <Tooltip
                    title='디제잉 1회당 제한 시간은 3분 이상부터 가능해요'
                    visible={!!errors.limit?.message}
                  >
                    <Typography type='body2' className='flexCol items-start'>
                      디제잉
                      <Typography
                        as='span'
                        type='body2'
                        className="after:ml-[0.2em] after:text-red-300 after:content-['*']"
                      >
                        제한시간
                      </Typography>
                    </Typography>
                  </Tooltip>
                }
                classNames={{ label: 'text-gray-200 !w-[80px] pr-0' }}
              >
                <InputNumber {...register('limit', { valueAsNumber: true })} initialValue={7} />
                <Typography as='span' type='detail1' className='text-gray-200 ml-[8px]'>
                  분
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
            <DjListItem userConfig={{ username: data?.user?.name || 'PFPlay User', src: '' }} />
          </FormItem>

          <Button
            type='submit'
            variant={'fill'}
            size='lg'
            className={'px-[74px]'}
            disabled={btnDisabled}
          >
            파티 개설하기
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PartyroomCreateForm;
