import { ComponentProps, ForwardedRef, forwardRef } from 'react';
import { cn } from '@/shared/lib/functions/cn';
import { PFCheckMark } from '@/shared/ui/icons';

type CheckboxProps = Omit<ComponentProps<'input'>, 'type'>;

const Checkbox = forwardRef(
  ({ className, ...props }: CheckboxProps, ref: ForwardedRef<HTMLInputElement>) => {
    return (
      <label
        className={cn(
          'flex justify-start items-center cursor-pointer',
          {
            'cursor-not-allowed': props.disabled,
            /**
             *  TODO: 디자인 시스템에 명시되어 있지 않은 임시 스타일이므로 추후 디자이너 협의 후 수정
             *  @see https://pfplay.slack.com/archives/C03QTFBU8QG/p1722682708793389?thread_ts=1722682306.376729&cid=C03QTFBU8QG
             */
            'opacity-30': props.disabled,
          },
          className
        )}
      >
        <input ref={ref} type='checkbox' className='peer sr-only' {...props} />

        <div className='border-2 border-gray-500 relative w-[24px] h-[24px] peer-checked:border-red-300 peer-checked:bg-red-300 peer-checked:[&>svg]:block'>
          <PFCheckMark className='absolute -top-[2px] -left-[2px] hidden' />
        </div>
      </label>
    );
  }
);

export default Checkbox;
