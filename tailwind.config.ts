import { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';
import { PluginAPI } from 'tailwindcss/types/config';
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

    function ({ addVariant }: PluginAPI) {
      addVariant('child-form-labels', '& label [data-custom-role="form-item-title"]');
    },

    plugin(({ addUtilities }) => {
      addUtilities({
        '.user-drag-none': {
          '-webkit-user-drag': 'none',
          '-khtml-user-drag': 'none',
          '-moz-user-drag': 'none',
          '-o-user-drag': 'none',
          'user-drag': 'none',
        },
      });
    }),
  ],
};

export default tailwindConfig;
