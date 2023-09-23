'use client';
import { ComponentProps, FC, ChangeEventHandler } from 'react';
import Typography from '@/components/@shared/@atoms/Typography';
import { cn } from '@/utils/cn';

export interface TextAreaProps
  extends Omit<ComponentProps<'textarea'>, 'value' | 'onChange' | 'className'> {
  value: string;
  onChange: (v: string) => void;
  className?: {
    container?: string;
    textarea?: string;
  };
}

const TextArea: FC<TextAreaProps> = ({
  value,
  onChange,
  placeholder,
  maxLength,
  className: { container: containerClassName, textarea: textareaClassName } = {},
  ...rest
}) => {
  const handleChangeTextArea: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className={cn('relative flex max-w-full', containerClassName)}>
      <textarea
        className={cn(
          'flex-1 min-h-max py-[12px] pl-[12px] pr-[60px] rounded-[4px]',
          'bg-gray-700 text-gray-50 placeholder:gray-400 caret-red-300',
          'focus:interaction-outline styled-scroll',
          textareaClassName
        )}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={handleChangeTextArea}
        {...rest}
      />

      {Number.isInteger(maxLength) && (
        <Typography
          className={cn('absolute top-[12px] right-[12px]', {
            'text-gray-400': !value.length,
            'text-gray-50': !!value.length,
          })}
        >
          <strong
            className={cn({
              'text-red-300': maxLength && value.length > maxLength,
            })}
          >
            {String(value.length).padStart(String(maxLength).length, '0')}
          </strong>
          /{maxLength}
        </Typography>
      )}
    </div>
  );
};

export default TextArea;
