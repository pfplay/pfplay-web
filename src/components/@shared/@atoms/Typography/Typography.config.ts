import { TypographyOverflow, TypographyType } from './Typography.types';

export const elDict: Record<TypographyType, keyof Pick<JSX.IntrinsicElements, 'h1' | 'h2' | 'p'>> =
  {
    title1: 'h1',
    title2: 'h2',
    body1: 'p',
    body2: 'p',
    body3: 'p',
    detail1: 'p',
    detail2: 'p',
    caption1: 'p',
    caption2: 'p',
  };

export const titleTypes: TypographyType[] = ['title1', 'title2'];

export const typoStyleDict: Record<TypographyType, string> = {
  title1: 'text-[28px] font-bold leading-[1.3]',
  title2: 'text-[24px] font-bold leading-[1.3]',
  body1: 'text-[20px] font-bold leading-[1.5]',
  body2: 'text-[18px] font-bold leading-[1.5]',
  body3: 'text-[16px] font-bold leading-[1.5]',
  detail1: 'text-[16px] font-normal leading-[1.5]',
  detail2: 'text-[14px] font-semibold leading-[1.5]',
  caption1: 'text-[14px] font-normal leading-[1.5]',
  caption2: 'text-[12px] font-normal leading-[1.5]',
};
export const overflowDict: Record<TypographyOverflow, string> = {
  ellipsis: 'truncate',
  'break-words': 'break-words',
  'break-all': 'break-all',
  'break-normal': 'break-normal',
};
