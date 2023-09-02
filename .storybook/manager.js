import favicon from '../public/logos/Symbol_medium_red.svg'; // TODO: favicon 추가되면 교체
import { addons } from '@storybook/manager-api';
import storybookTheme from './theme';

addons.setConfig({
  theme: storybookTheme,
});

const link = document.createElement('link');
link.setAttribute('rel', 'shortcut icon');
link.setAttribute('href', favicon);
document.head.appendChild(link);
