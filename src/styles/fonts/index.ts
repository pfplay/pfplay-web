import localFont from 'next/font/local';

export const pretendardVariable = localFont({
  src: './pretendard/woff2/PretendardVariable.woff2',
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
