import localFont from 'next/font/local';

export const pretendardVariable = localFont({
  src: './pretendard-variable.woff2',
  display: 'fallback',
  weight: '45 920',
  style: 'normal',
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'system-ui',
    'Roboto',
    'Helvetica Neue',
    'Segoe UI',
    'Apple SD Gothic Neo',
    'Noto Sans KR',
    'Malgun Gothic',
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'sans-serif',
  ],
});

export const galmuriFont = localFont({
  src: [
    {
      path: './Galmuri11.woff2',
      weight: '400',
    },
    {
      path: './Galmuri11-Bold.woff2',
      weight: '700',
    },
  ],
  display: 'fallback',
  style: 'normal',
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'system-ui',
    'Roboto',
    'Helvetica Neue',
    'Segoe UI',
    'Apple SD Gothic Neo',
    'Noto Sans KR',
    'Malgun Gothic',
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'sans-serif',
  ],
});
