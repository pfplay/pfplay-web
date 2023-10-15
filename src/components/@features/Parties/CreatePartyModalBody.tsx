'use client';
import React from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/@shared/@atoms/Button';
import Input from '@/components/@shared/@atoms/Input';
import InputNumber from '@/components/@shared/@atoms/InputNumber';
import TextArea from '@/components/@shared/@atoms/TextArea';
import Tooltip from '@/components/@shared/@atoms/Tooltip';
import Typography from '@/components/@shared/@atoms/Typography';
import DjListItem from '@/components/@shared/DjListItem';
import FormItem from '@/components/@shared/FormItem';

const createPartyFormSchema = z.object({
  partyName: z
    .string()
    .min(1, { message: '1자 이상 입력해주세요' })
    .max(30, { message: '한글 30자, 영문 30자 제한 / 띄어쓰기,특수문자 사용 불가' })
    .refine((value) => /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]*$/.test(value), {
      message: '한글 30자, 영문 30자 제한 / 띄어쓰기,특수문자 사용 불가',
    }),
  introduction: z
    .string()
    .min(1, { message: '1자 이상 입력해주세요' })
    .max(50, { message: '한/영 구분 없이 띄어쓰기 포함 50자 제한' }),
  domain: z.string(),
  playTimeLimit: z.coerce
    .number({ invalid_type_error: '디제잉 1회당 제한 시간은 3분 이상부터 가능해요' })
    .int()
    .nonnegative()
    .gte(3, { message: '디제잉 1회당 제한 시간은 3분 이상부터 가능해요' }),
});

type CreatePartyFormValues = z.infer<typeof createPartyFormSchema>;

const CreatePartyModalBody = () => {
  const {
    handleSubmit,
    control,

    formState: { errors, isValid },
  } = useForm<CreatePartyFormValues>({
    mode: 'all',
    resolver: zodResolver(createPartyFormSchema),
    defaultValues: {
      partyName: '',
      introduction: '',
      domain: '',
      playTimeLimit: 7,
    },
  });

  const handleFormSubmit: SubmitHandler<CreatePartyFormValues> = (values) => {
    console.log({ values, errors });
  };

  const btnDisabled = Object.keys(errors).length > 0 || !isValid;

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className='flexCol items-center justify-between mx-auto'
    >
      <div className='items-end gap-12 flexCol'>
        <Controller
          control={control}
          name='partyName'
          render={({ field: { ref: _ref, ...fields } }) => (
            <FormItem
              label='파티이름'
              error={errors.partyName?.message}
              required
              classNames={{ label: 'text-gray-200', container: 'w-[680px]' }}
            >
              <Input
                {...fields}
                maxLength={30}
                placeholder='한글 8자, 영문 16자 제한/띄어쓰기, 특수문자 사용 불가'
              />
            </FormItem>
          )}
        />
        <Controller
          control={control}
          name='introduction'
          render={({ field: { ref: _ref, ...fields } }) => (
            <FormItem
              label='파티 소개'
              required
              error={errors.introduction && '한/영 구분 없이 띄어쓰기 포함 50자 제한'}
              classNames={{ label: 'text-gray-200', container: 'w-[680px]' }}
            >
              <TextArea
                {...fields}
                maxLength={50}
                rows={3}
                placeholder='한/영 구분 없이 띄어쓰기 포함 50자 제한'
              />
            </FormItem>
          )}
        />
        <div className='w-full flexRow items-center justify-between gap-8'>
          <Controller
            control={control}
            name='domain'
            render={({ field: { ref: _ref, ...fields } }) => (
              <FormItem
                label={
                  <Typography as='span' type='body2' className='text-left'>
                    도메인
                    <Typography as='span' type='detail2'>
                      (선택)
                    </Typography>
                  </Typography>
                }
                classNames={{ label: 'text-gray-200', container: 'flex-1' }}
              >
                <Input {...fields} placeholder='웹 페이지 주소는 pfplay.io/도메인으로 시작' />
              </FormItem>
            )}
          />
          <div className='flexRow items-center gap-4'>
            <Controller
              control={control}
              name='playTimeLimit'
              render={({ field: { ref: _ref, ...fields } }) => (
                <Tooltip
                  title='디제잉 1회당 제한 시간은 3분 이상부터 가능해요'
                  visible={!!errors.playTimeLimit?.message}
                >
                  {/* TODO: Tooltip에 input 에러추가 */}
                  <>
                    <FormItem
                      fit
                      label={
                        <Typography as='span' type='body2' className='flexCol items-start'>
                          디제잉
                          <Typography
                            as='span'
                            type='body2'
                            className="after:ml-[0.2em] after:text-red-300 after:content-['*']"
                          >
                            제한시간
                          </Typography>
                        </Typography>
                      }
                      classNames={{ label: 'text-gray-200' }}
                    >
                      <InputNumber {...fields} />
                    </FormItem>
                    <Typography type='detail1' className='text-gray-200'>
                      분
                    </Typography>
                  </>
                </Tooltip>
              )}
            />
          </div>
        </div>
        <div className='w-full flexRow justify-between items-center'>
          <FormItem
            label={
              <Typography as='span' type='body2'>
                Admin
              </Typography>
            }
            classNames={{ label: 'text-gray-200', container: 'ml-7' }}
          >
            <DjListItem userConfig={{ username: 'Pfplay User', src: '' }} />
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
