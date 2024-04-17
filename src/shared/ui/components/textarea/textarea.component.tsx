'use client';
import { ComponentProps, ChangeEventHandler, useState, forwardRef } from 'react';
import { cn } from '@/shared/lib/cn';
import { Typography } from '../typography';

export interface TextAreaProps extends Omit<ComponentProps<'textarea'>, 'value' | 'className'> {
  initialValue?: string;
  classNames?: {
    container?: string;
    textarea?: string;
  };
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      initialValue = '',
      onChange,
      placeholder,
      maxLength,
      classNames: { container: containerClassName, textarea: textareaClassName } = {},
      ...rest
    },
    ref
  ) => {
    const [localValue, setLocalValue] = useState<string>(initialValue);
    const [_textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);

    const handleChangeTextArea: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
      setLocalValue(e.target.value);
      onChange?.(e);
    };

    return (
      <div className={cn('relative flex max-w-full', containerClassName)}>
        <textarea
          ref={(node) => {
            setTextareaRef(node);
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          className={cn(
            'flex-1 min-h-max py-[12px] pl-[12px] pr-[60px] rounded-[4px]',
            'bg-gray-700 text-gray-50 placeholder:gray-400 caret-red-300',
            'focus:interaction-outline styled-scroll',
            textareaClassName
          )}
          placeholder={placeholder}
          onChange={handleChangeTextArea}
          {...rest}
        />

        {Number.isInteger(maxLength) && (
          <Typography
            className={cn('absolute top-[12px] right-[12px]', {
              'text-gray-400': !localValue.length,
              'text-gray-50': !!localValue.length,
            })}
          >
            <strong
              className={cn({
                'text-red-300': maxLength && localValue.length > maxLength,
              })}
            >
              {String(localValue.length).padStart(String(maxLength).length, '0')}
            </strong>
            /{maxLength}
          </Typography>
        )}
      </div>
    );
  }
);

export default TextArea;
