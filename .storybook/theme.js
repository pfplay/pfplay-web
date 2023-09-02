import { create } from '@storybook/theming/create';
import logo from '../public/logos/wordmark_small_white.svg';

export default create({
  base: 'dark',
  brandTitle: 'PFPlay',
  brandUrl: 'https://github.com/pfplay/pfplay-web',
  brandImage: logo,
  brandTarget: '_blank',
});
