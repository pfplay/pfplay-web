import { Config } from 'tailwindcss';
import { PluginAPI } from 'tailwindcss/types/config';
import theme from './src/shared/ui/foundation/theme';

const tailwindConfig: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: theme.colors,
    screens: theme.screens,
    extend: {
      ...theme,
      zIndex: valuesMap(theme.zIndex, (value) => value.toString()),
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),

    function ({ addVariant }: PluginAPI) {
      addVariant('child-form-labels', '& label [data-custom-role="form-item-title"]');
    },
  ],
};

export default tailwindConfig;

function valuesMap<T, U>(obj: Record<string, T>, mapper: (value: T) => U): Record<string, U> {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, mapper(value)]));
}
