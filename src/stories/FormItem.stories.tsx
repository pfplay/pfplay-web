import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react';
import { z } from 'zod';
import FormItem, { FormItemProps } from '@/components/shared/FormItem';
import Button from '@/components/shared/atoms/Button';
import Typography from '@/components/shared/atoms/Typography';
import { cn } from '@/utils/cn';

const meta = {
  title: 'ui/FormItem',
  component: FormItem,
  tags: ['autodocs'],
} satisfies Meta<typeof FormItem>;

export default meta;
type Story = StoryObj<typeof meta>;

const TEMP_INPUT_STYLES = 'text-black h-[48px] w-full rounded-[4px] p-[10px]'; // FIXME: 아직 Input 아톰 추가 안됨

export const Preview: Story = {
  args: {
    label: 'Label',
    required: true,
    children: <input className={TEMP_INPUT_STYLES} />,
  },
};

export const Align = {
  name: 'Multiple FormItem Label Align',
  render: () => (
    <div>
      <Typography className='text-white mb-[20px]'>
        💡 부모 요소에 <b className='text-red-300'>child-form-labels</b> 셀렉터를 사용해서 라벨
        타이틀 영역에 width 를 부여하세요.
      </Typography>

      <form className='flex flex-col gap-[20px] child-form-labels:w-[120px]'>
        <FormItem label='Label' required>
          <input className={TEMP_INPUT_STYLES} />
        </FormItem>
        <FormItem label='LabelAAAAA'>
          <input className={TEMP_INPUT_STYLES} />
        </FormItem>
        <FormItem label='LabelBBB'>
          <input className={TEMP_INPUT_STYLES} />
        </FormItem>
      </form>
    </div>
  ),
};

export const Vertical = {
  render: () => (
    <form className='flex flex-col gap-[20px]'>
      <FormItem label='Label' layout='vertical' required>
        <input className={TEMP_INPUT_STYLES} />
      </FormItem>
      <FormItem label='LabelAAAAA' layout='vertical'>
        <input className={TEMP_INPUT_STYLES} />
      </FormItem>
      <FormItem label='LabelBBB' layout='vertical' error='Error'>
        <input className={TEMP_INPUT_STYLES} />
      </FormItem>
    </form>
  ),
};

export const Fit: Story = {
  args: {
    label: 'Label',
    required: true,
    fit: true,
    children: <input className={cn(TEMP_INPUT_STYLES, 'w-[300px]')} />,
  },
};

type Fields = {
  myBool: boolean;
  myNum: number;
  myStr: string;
};
const schema = z.object({
  myBool: z.boolean().refine(Boolean, {
    message: '동의해야 합니다.',
  }),
  myNum: z.number({
    invalid_type_error: '숫자를 입력해주세요.',
    required_error: '필수 입력입니다',
  }),
  myStr: z.string().refine((v) => /\S/.test(v), {
    message: '필수 입력입니다',
  }),
});
export const ProcessError = (args: Omit<FormItemProps, 'label' | 'error'>) => {
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm<Fields>({
    mode: 'onSubmit',
    resolver: zodResolver(schema),
    defaultValues: {
      myBool: false,
    },
  });

  return (
    <section className='flex flex-col gap-[20px]'>
      <form
        onSubmit={handleSubmit((data) => {
          alert(JSON.stringify(data, null, 2));
        })}
        className='flex flex-col gap-[20px] child-form-labels:w-[120px]'
      >
        <FormItem label='Checkbox' error={errors.myBool?.message} required fit {...args}>
          <input type='checkbox' className='w-[20px] h-[20px]' {...register('myBool')} />
        </FormItem>
        <FormItem label='Number' error={errors.myNum?.message} required {...args}>
          <input
            type='number'
            className={TEMP_INPUT_STYLES}
            {...register('myNum', { valueAsNumber: true })}
          />
        </FormItem>
        <FormItem label='String' error={errors.myStr?.message} required {...args}>
          <textarea
            className={cn(TEMP_INPUT_STYLES, 'h-[200px] leading-[1.5]')}
            {...register('myStr')}
          />
        </FormItem>

        <Button type='submit' className='w-[300px] self-center'>
          제출
        </Button>
      </form>

      <section className='flex flex-col gap-4'>
        <hr />
        Data
        <pre>{JSON.stringify(watch(), null, 2)}</pre>
        <hr />
        Errors
        <pre>
          {JSON.stringify(
            {
              myBool: errors.myBool?.message,
              myNum: errors.myNum?.message,
            },
            null,
            2
          )}
        </pre>
      </section>
    </section>
  );
};
