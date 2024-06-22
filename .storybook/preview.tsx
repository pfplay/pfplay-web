import '@/shared/ui/foundation/globals.css';
import './styles.css';

import type { Preview } from '@storybook/react';
import { DialogProvider } from '@/shared/ui/components/dialog';
import { I18nProvider } from '@/shared/lib/localization/i18n.context';
import en from '@/shared/lib/localization/dictionaries/en.json';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#111111' }],
    },
    options: {
      storySort: {
        order: ['base', 'features'],
      },
    },
  },
  decorators: [
    (Story) => (
      <I18nProvider dictionary={en}>
        <DialogProvider>
          <Story />
        </DialogProvider>
      </I18nProvider>
    ),
  ],
};

export default preview;
