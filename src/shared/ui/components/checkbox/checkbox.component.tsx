import { ComponentProps, ForwardedRef, forwardRef } from 'react';
import { cn } from '@/shared/lib/cn';
import { PFCheckMark } from '@/shared/ui/icons';

export type CheckboxProps = Omit<ComponentProps<'input'>, 'type'>;

export const Checkbox = forwardRef(function Checkbox(
  { className, ...props }: CheckboxProps,
  ref: ForwardedRef<HTMLInputElement>
) {
  return (
    <label className={cn('flex justify-start cursor-pointer items-center', className)}>
      <input ref={ref} type='checkbox' className='peer sr-only' {...props} />

      <div className='border-2 relative w-[24px] h-[24px] peer-checked:border-red-300 peer-checked:bg-red-300 peer-checked:[&>svg]:block'>
        <PFCheckMark className='absolute -top-[2px] -left-[2px] hidden' />
      </div>
    </label>
  );
});
