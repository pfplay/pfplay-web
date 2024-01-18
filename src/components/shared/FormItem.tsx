import { FC, PropsWithChildren, ReactNode } from 'react';
import Typography from '@/components/shared/atoms/Typography';
import { cn } from '@/utils/cn';

type Axis = 'vertical' | 'horizontal';
export interface FormItemProps {
  label: ReactNode;
  layout?: Axis;
  required?: boolean;
  error?: string | boolean;
  tooltipError?: string;
  fit?: boolean;
  classNames?: {
    container?: string;
    label?: string;
    childrenWrapper?: string;
  };
}

const FormItem: FC<PropsWithChildren<FormItemProps>> = ({
  children,
  label,
  layout = 'horizontal',
  required,
  error,
  fit,
  classNames,
}) => {
  return (
    <label
      className={cn([
        'grid gap-x-[16px] gap-y-[8px] items-center grid-rows-max auto-rows-max',
        layout === 'horizontal' && {
          'grid-cols-[max-content_1fr]': !fit,
          'grid-cols-[max-content_max-content]': fit,
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
      {typeof label === 'string' ? (
        <Typography
          type={layout === 'horizontal' ? 'body2' : 'detail2'}
          data-custom-role='form-item-title'
          overflow='break-keep'
          className={cn([...labelTextStyle(layout, required), classNames?.label])}
        >
          {label}
        </Typography>
      ) : (
        <div
          data-custom-role='form-item-title'
          className={cn([...labelTextStyle(layout, required), classNames?.label])}
        >
          {label}
        </div>
      )}

      <div
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
          <div
            className={cn({
              hidden: layout === 'vertical',
              block: layout === 'horizontal',
            })}
          />

          <FormItemError>{error}</FormItemError>
        </>
      )}
    </label>
  );
};

export const FormItemError = ({ children }: PropsWithChildren) => {
  return (
    <Typography
      type='caption1'
      overflow='break-keep'
      className={cn(['pl-[12px] text-red-300 text-left'])}
    >
      {children}
    </Typography>
  );
};

const labelTextStyle = (layout: Axis, required?: boolean) => {
  return [
    'relative pr-[12px]',
    {
      'text-start text-gray-300': layout === 'vertical',
      'text-right': layout === 'horizontal',
    },
    required && "after:ml-[0.2em] after:text-red-300 after:content-['*']",
  ];
};

export default FormItem;
