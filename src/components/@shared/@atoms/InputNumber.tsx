'use client';
import { FC, ChangeEventHandler } from 'react';
import { cn } from '@/utils/cn';

export interface InputNumberProps {
  value?: number;
  onChange: (v: number) => void;
  max?: number;
  min?: number;
  locale?: boolean;
  className?: string;
}

const InputNumber: FC<InputNumberProps> = ({
  value,
  onChange,
  max,
  min,
  locale = true,
  className,
  ...rest
}) => {
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // 현재 소수점, 음수 미지원

    if (value === '') {
      onChange(0);
      return;
    }

    const numValue = Number(value);
    if (max !== undefined && numValue > max) {
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
