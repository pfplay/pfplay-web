import '../src/styles/globals.css';
import './styles.css';
import React from 'react';
import type { Preview } from '@storybook/react';
import { DialogProvider } from '../src/context/DialogProvider';

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
