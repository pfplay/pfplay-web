import { Config } from 'tailwindcss';
import { PluginAPI } from 'tailwindcss/types/config';
import theme from './src/shared/ui/foundation/theme';

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
  ],
};

export default tailwindConfig;
