'use client';
import { ChangeEventHandler, ComponentProps, useState, forwardRef } from 'react';
import { cn } from '@/shared/lib/functions/cn';

export interface InputNumberProps extends Omit<ComponentProps<'input'>, 'type' | 'value'> {
  initialValue?: number | '';
  locale?: boolean;
}

const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
  ({ initialValue = '', onChange, max, min, className, locale = false, ...rest }, ref) => {
    const [localValue, setLocalValue] = useState<number | ''>(initialValue);
    const [_inputRef, setInputRef] = useState<HTMLInputElement | null>(null);

    const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
      const value = e.target.value.replace(/[^0-9]/g, ''); // 현재 소수점, 음수 미지원

      const numValue = Number(value);
      if (max !== undefined && typeof max === 'number' && numValue > max) {
        setLocalValue(max);
        onChange?.(e);
        return;
      }

      if (min !== undefined && typeof min === 'number' && numValue < min) {
        setLocalValue(min);
        onChange?.(e);
        return;
      }

      setLocalValue(numValue);
      onChange?.(e);
    };

    return (
      <input
        ref={(node) => {
          setInputRef(node);
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        type='text'
        className={cn(
          'w-[83px] h-[48px] px-[12px] rounded-[4px] text-center',
          'bg-gray-700 placeholder:gray-400 text-gray-50 caret-red-300 focus:interaction-outline',
          className
        )}
        value={locale ? localValue?.toLocaleString() : localValue}
        onChange={handleChange}
        {...rest}
      />
    );
  }
);

export default InputNumber;
