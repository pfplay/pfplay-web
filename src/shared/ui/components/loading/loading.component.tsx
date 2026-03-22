import { CSSProperties, FC } from 'react';

export interface LoadingProps {
  size?: CSSProperties['width'];
  color?: CSSProperties['color'];
}

const Loading: FC<LoadingProps> = ({ size = '1em', color = 'currentColor' }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      className='animate-loading'
    >
      <path
        d='M15.1312 2.5C19.1204 3.81408 22 7.57075 22 12C22 17.5228 17.5228 22 12 22C7.57075 22 3.81408 19.1204 2.5 15.1312'
        stroke={color}
        strokeWidth={3}
      />
    </svg>
  );
};

export default Loading;
