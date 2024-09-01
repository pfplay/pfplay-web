import { ReactNode } from 'react';
import { cn } from '@/shared/lib/functions/cn';
import { Typography } from '@/shared/ui/components/typography';

type Props = {
  icon: ReactNode;
  text: string | number;
  disabled?: boolean;
  active: boolean;
  activeColor?: 'red' | 'green' | 'white';
  onClick: () => void;
};

export default function ActionButton({
  icon,
  text,
  disabled,
  active,
  activeColor,
  onClick,
}: Props) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'appearance-none w-[48px] h-[44px] flexColCenter text-center gap-[4px] rounded bg-gray-800 text-gray-200',
        {
          'cursor-pointer': !active,
        }
      )}
      style={{
        // FIXME: 디자인 시스템에 없는 컬러가 피그마에 적용되어 있음. 디자이너 팀 문의 필요
        color: active
          ? activeColor === 'red'
            ? '#FF0000'
            : activeColor === 'green'
            ? '#00FF00'
            : '#FFFFFF'
          : undefined,
      }}
    >
      {icon}
      <Typography type='detail1' className='leading-none'>
        {text}
      </Typography>
    </button>
  );
}
