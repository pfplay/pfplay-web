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
  },
  backgroundImage: {
    onboarding: "url('/image/Onboard.png')",
    partyRoom: "url('/image/PartyRoom.png')",
    'gradient-red': 'linear-gradient(to right top, #780808, #AE001F)',
  },
  screens: {
    mobile: '400px',
    tablet: '768px',
    laptop: '1024px',
    desktop: '1280px',
  },
  zIndex: {
    dialog: '1000',
    tooltip: '1001',
  },
  animation: {
    loading: 'loading 2s infinite',
  },
  keyframes: {
    loading: {
      '0%': { transform: 'rotateZ(0deg)' },
      '50%': { transform: 'rotateZ(480deg)' },
      '100%': { transform: 'rotateZ(1080deg)' },
    },
  },
} as const;

export default theme;