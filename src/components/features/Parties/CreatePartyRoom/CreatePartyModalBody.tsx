'use client';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PartiesService } from '@/api/services/Parties';
import DjListItem from '@/components/shared/DjListItem';
import FormItem from '@/components/shared/FormItem';
import Button from '@/components/shared/atoms/Button';
import Input from '@/components/shared/atoms/Input';
import InputNumber from '@/components/shared/atoms/InputNumber';
import TextArea from '@/components/shared/atoms/TextArea';
import Tooltip from '@/components/shared/atoms/Tooltip';
import Typography from '@/components/shared/atoms/Typography';

const createPartyFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: '1자 이상 입력해주세요' })
    .max(30, { message: '한글 30자, 영문 30자 제한 / 띄어쓰기,특수문자 사용 불가' })
    .refine((value) => /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]*$/.test(value), {
      message: '한글 30자, 영문 30자 제한 / 띄어쓰기,특수문자 사용 불가',
    }),
  introduce: z
    .string()
    .min(1, { message: '1자 이상 입력해주세요' })
    .max(50, { message: '한/영 구분 없이 띄어쓰기 포함 50자 제한' }),
  domain: z
    .string()
    .optional()
    .refine((value) => !value || /^\S*$/.test(value), {
      message: '도메인에 공백이나 띄어쓰기를 포함할 수 없습니다',
    }),
  limit: z.coerce
    .number({ invalid_type_error: '디제잉 1회당 제한 시간은 3분 이상부터 가능해요' })
    .int()
    .nonnegative()
    .gte(3, { message: '디제잉 1회당 제한 시간은 3분 이상부터 가능해요' }),
});

type CreatePartyFormValues = z.infer<typeof createPartyFormSchema>;

const CreatePartyModalBody = () => {
  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
  } = useForm<CreatePartyFormValues>({
    mode: 'all',
    resolver: zodResolver(createPartyFormSchema),
    defaultValues: {
      name: '',
      introduce: '',
      domain: '',
      limit: 7,
    },
  });

  const handleFormSubmit: SubmitHandler<CreatePartyFormValues> = async ({
    name,
    introduce,
    limit,
    domain,
  }) => {
    try {
      await PartiesService.createPartyRoom({
        name,
        introduce,
        limit,
        domain: domain || null,
      });
    } catch (error) {
      // TODO: Error handling 디자인 나오면 따라서 에러 처리
      console.log(error);
    }
  };

  const btnDisabled = Object.keys(errors).length > 0 || !isValid;

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
            <DjListItem userConfig={{ username: 'PFPlay User', src: '' }} />
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

export default CreatePartyModalBody;
