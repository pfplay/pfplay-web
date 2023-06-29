/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        statesColor: '#EAEAEA',
        red: {
          1: '#FF5B65',
          2: '#F31F2C',
          3: '#B41024',
          4: '#AE001F',
          5: '#990316',
          6: '#780808',
        },
        grey: {
          1: '#FDFDFD',
          2: '#F5F5F5',
          3: '#DADADA',
          4: '#969696',
          5: '#707070',
          6: '#545454',
          7: '#434343',
          8: '#2F2F2',
          9: '#1C1C1C',
          10: '#111111',
        },
        dim: 'rgba(0, 0, 0, 0.6)',
      },
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
