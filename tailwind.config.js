/** @type {import('tailwindcss').Config} */
import { fontFamily } from 'tailwindcss/defaultTheme';

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF',
        black: '#000000',
        red: {
          200: '#FF5B65',
          300: '#F31F2C',
          400: '#B41024',
          500: '#990316',
        },
        grey: {
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
      },
      backgroundImage: {
        onboarding: "url('/image/Onboard.png')",
        partyRoom: "url('/image/PartyRoom.png')",
        'gradient-red': 'linear-gradient(to right top, #780808, #AE001F)',
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
