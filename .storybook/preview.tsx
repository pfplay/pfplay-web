import '@/shared/ui/foundation/globals.css';
import './styles.css';

import type { Preview } from '@storybook/react';
import { DialogProvider } from '@/shared/ui/components/dialog';

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
      <DialogProvider>
        <Story />
      </DialogProvider>
    ),
  ],
};

export default preview;
