/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme');

const darkRedThemeColors = {
  red500: '#990316',
  red600: '#B41024',
  red700: '#F31F2C',
  red800: '#FF5B65',
  redGradientStart: '#780808',
  redGradientEnd: '#AE001F',
  statesColor: '#EAEAEA',
  gray50: '#111111',
  gray100: '#1C1C1C',
  gray200: '#2F2F2',
  gray300: '#434343',
  gray400: '#545454',
  gray500: '#707070',
  gray600: '#969696',
  gray700: '#DADADA',
  gray800: '#F5F5F5',
  gray900: '#FDFDFD',
  dim: 'rgba(0, 0, 0, 0.6)',
};

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: darkRedThemeColors,
      backgroundImage: {
        onboarding: "url('/image/Onboard.png')",
        partyRoom: "url('/image/PartyRoom.png')",
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
      },
      screens: {
        // TODO: Set fixed breakpoints
        tablet: '640px',
        laptop: '1024px',
        desktop: '1280px',
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
};
