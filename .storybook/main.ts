import type { StorybookConfig } from '@storybook/nextjs';
import { DomId } from '@/constants/dom-id';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  previewBody: (body) => `
    ${body}
    <div id="${DomId.TooltipRoot}"></div>
  `,
  staticDirs: ['../public'],
};

export default config;
