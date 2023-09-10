import { FC, PropsWithChildren, ReactNode } from 'react';
import clsx from 'clsx';
import Typography from '@/components/@shared/@atoms/Typography';
import { cn } from '@/lib/utils';

export interface FormItemProps {
  label: ReactNode;
  required?: boolean;
  error?: string | boolean;
  fit?: boolean;

  classNames?: {
    container?: string;
    title?: string;
    childrenWrapper?: string;
  };
}

const FormItem: FC<PropsWithChildren<FormItemProps>> = ({
  children,
  label,
  required,
  error,
  fit,
  classNames,
}) => {
  return (
    <label
      className={cn([
        'grid gap-x-[16px] gap-y-[12px] items-center grid-rows-max auto-rows-max',
        'md:gap-y-[6px]',
        {
          'md:grid-cols-[max-content_1fr]': !fit,
          'md:grid-cols-[max-content_max-content]': fit,
        },
        classNames?.container,
      ])}
      onClick={(e) => {
        /* 여백 영역 클릭시 children focus 방지용 */
        const target = e.target as HTMLElement;
        const currentTarget = e.currentTarget as HTMLElement;

        if (target.tagName === 'LABEL' && currentTarget.tagName === 'LABEL') {
          e.preventDefault();
        }
      }}
    >
      <Typography
        type='body2'
        data-custom-role='form-item-title'
        overflow='break-keep'
        className={cn([
          'relative md:text-right',
          required && "after:ml-[0.2em] after:text-red-300 after:content-['*']",
          classNames?.title,
        ])}
      >
        {label}
      </Typography>

      <div
        data-custom-role='form-item-label'
        className={cn([
          'leading-none' /* FIXME: 이 속성이 들어간 이유 스레드 내용 참고 - https://pfplay.slack.com/files/U05CVKV905U/F05RGLGFE14/image.png */,
          fit && 'w-max',
          error && 'rounded-[4px] caret-red-300 outline outline-red-300',
          classNames?.childrenWrapper,
        ])}
      >
        {children}
      </div>

      {typeof error === 'string' && (
        <>
          <div className='hidden md:block' />

          <Typography
            type='caption1'
            overflow='break-keep'
            className={clsx(['pl-[12px] text-red-300'])}
          >
            {error}
          </Typography>
        </>
      )}
    </label>
  );
};

export default FormItem;
