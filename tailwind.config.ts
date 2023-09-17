import { Config } from 'tailwindcss';
import theme from './src/styles/theme';

const tailwindConfig: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: theme.colors,
    screens: theme.screens,
    extend: theme,
  },
  plugins: [
    require('tailwind-scrollbar-hide'),

    function ({ addVariant }) {
      addVariant('child-form-labels', '& label [data-custom-role="form-item-title"]');
    },
  ],
};

export default tailwindConfig;
