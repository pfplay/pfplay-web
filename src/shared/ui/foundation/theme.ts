type Screen = 'mobile' | 'tablet' | 'laptop' | 'desktop';
export const breakPoints: Record<Screen, string> = {
  mobile: '400px',
  tablet: '768px',
  laptop: '1024px',
  desktop: '1280px',
};

const theme = {
  colors: {
    white: '#FFFFFF',
    black: '#000000',
    red: {
      200: '#FF5B65',
      300: '#F31F2C',
      400: '#B41024',
      500: '#990316',
    },
    gray: {
      50: '#FDFDFD',
      100: '#F5F5F5',
      200: '#DADADA',
      300: '#969696',
      400: '#707070',
      500: '#545454',
      600: '#434343',
      700: '#2F2F2F',
      800: '#1C1C1C',
      900: '#111111',
    },
    dim: 'rgba(0, 0, 0, 0.6)',
    transparent: 'transparent',
    'backdrop-black': '#180202',
  },
  backgroundImage: {
    onboarding: "url('/images/Background/Onboard.png')",
    partyRoom: "url('/images/Background/Partyroom.png')",
    'gradient-red': 'linear-gradient(to right top, #780808, #AE001F)',
  },
  width: breakPoints,
  minWidth: breakPoints,
  maxWidth: breakPoints,
  minHeight: breakPoints,
  maxHeight: breakPoints,
  screens: breakPoints,
  zIndex: {
    /**
     * 테일윈드 config.theme의 zIndex values는 string 타입이여야 하지만,
     * zIndex는 덧셈 연산 등을 위해 number로 선언 후 나중에 string으로 컨버팅 하도록 함
     */
    drawer: 30,
    dialog: 1000,
    tooltip: 1001,
  },
  listStyleType: {
    latin: 'lower-latin',
    inherit: 'inherit',
  },
  animation: {
    loading: 'loading 2s infinite',
    'mail-bounce': 'mail-bounce 1100ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
    'mail-bounce-reduced': 'mail-bounce-reduced 500ms ease-out forwards',
  },
  keyframes: {
    loading: {
      '0%': { transform: 'rotateZ(0deg)' },
      '50%': { transform: 'rotateZ(480deg)' },
      '100%': { transform: 'rotateZ(1080deg)' },
    },
    'mail-bounce': {
      '0%': {
        opacity: '0',
        transform: 'translate3d(0, 8px, 0) scale(0.92)',
      },
      '15%': {
        opacity: '1',
        transform: 'translate3d(0, 0, 0) scale(1)',
      },
      '35%': {
        opacity: '1',
        transform: 'translate3d(0, -8px, 0) scale(1.04)',
      },
      '50%': {
        opacity: '1',
        transform: 'translate3d(0, -3px, 0) scale(0.98)',
      },
      '65%': {
        opacity: '1',
        transform: 'translate3d(0, -12px, 0) scale(1.02)',
      },
      '100%': {
        opacity: '0',
        transform: 'translate3d(0, -28px, 0) scale(0.96)',
      },
    },
    'mail-bounce-reduced': {
      '0%': {
        opacity: '0',
      },
      '20%': {
        opacity: '1',
      },
      '100%': {
        opacity: '0',
      },
    },
  },
  aspectRatio: {
    'partyroom-bg': '1920/1080',
  },
} as const;

export default theme;
