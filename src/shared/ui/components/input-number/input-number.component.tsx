'use client';
import { ChangeEventHandler, ComponentProps, useState, forwardRef, useRef } from 'react';
import { cn } from '@/shared/lib/functions/cn';
import { combineRef } from '@/shared/lib/functions/combine-ref';

export interface InputNumberProps
  extends Omit<ComponentProps<'input'>, 'type' | 'value' | 'defaultValue'> {
  defaultValue?: number;
  value?: number;
  locale?: boolean;
}

const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
  ({ defaultValue, value, onChange, max, min, className, locale = false, ...rest }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const combinedRef = combineRef([ref, inputRef]);

    const [localValue, setLocalValue] = useState(defaultValue);
    const _value = value ?? localValue;

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
        ref={combinedRef}
        type='text'
        className={cn(
          'w-[83px] h-[48px] px-[12px] rounded-[4px] text-center',
          'bg-gray-700 placeholder:gray-400 text-gray-50 caret-red-300 focus:interaction-outline',
          className
        )}
        value={locale ? _value?.toLocaleString() : _value}
        onChange={handleChange}
        {...rest}
      />
    );
  }
);

export default InputNumber;
