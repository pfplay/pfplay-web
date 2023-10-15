'use client';
import { FC, ChangeEventHandler, ComponentProps } from 'react';
import { cn } from '@/utils/cn';

export interface InputNumberProps
  extends Omit<ComponentProps<'input'>, 'type' | 'value' | 'onChange'> {
  value?: number;
  onChange: (v: number) => void;
  min?: number;
  locale?: boolean;
}

const InputNumber: FC<InputNumberProps> = ({
  value,
  onChange,
  max,
  min,
  className,
  locale = false,
  ...rest
}) => {
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // 현재 소수점, 음수 미지원

    const numValue = Number(value);
    if (max !== undefined && typeof max === 'number' && numValue > max) {
      onChange(max);
      return;
    }

    if (min !== undefined && numValue < min) {
      onChange(min);
      return;
    }

    onChange(numValue);
  };

  return (
    <input
      type='text'
      className={cn(
        'w-[83px] h-[48px] px-[12px] rounded-[4px] text-center',
        'bg-gray-700 placeholder:gray-400 text-gray-50 caret-red-300 focus:interaction-outline',
        className
      )}
      value={locale ? value?.toLocaleString() : value}
      onChange={handleChange}
      {...rest}
    />
  );
};

export default InputNumber;
