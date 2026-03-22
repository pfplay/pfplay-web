import favicon from '../public/images/Logo/Symbol_medium_red.png'; // TODO: favicon 추가되면 교체
import { addons } from '@storybook/manager-api';
import storybookTheme from './theme';

addons.setConfig({
  theme: storybookTheme,
});

const link = document.createElement('link');
link.setAttribute('rel', 'shortcut icon');
link.setAttribute('href', favicon);
document.head.appendChild(link);
