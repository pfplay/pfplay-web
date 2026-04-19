'use client';

import { type FC, useState } from 'react';

type CountryFlagProps = {
  /** ISO 3166-1 alpha-2 국가 코드 (e.g. "KR") */
  code: string;
  /** 크기 (px), default 16 */
  size?: number;
};

export const CountryFlag: FC<CountryFlagProps> = ({ code, size = 16 }) => {
  const [hasError, setHasError] = useState(false);

  if (!code || code.length !== 2 || hasError) {
    return null;
  }

  const upperCode = code.toUpperCase();
  const height = Math.round(size * (2 / 3));

  return (
    <img
      src={`/flags/${upperCode}.svg`}
      alt={upperCode}
      width={size}
      height={height}
      className='rounded-sm overflow-hidden inline-block'
      onError={() => setHasError(true)}
    />
  );
};
