import { ButtonColor, ButtonVariant } from './Button.types';

export function getDisabledStyles(color: ButtonColor, variant: ButtonVariant, disabled?: boolean) {
  if (!disabled) return;

  const disabledColorsDict: Record<ButtonColor, Record<ButtonVariant, string>> = {
    primary: {
      fill: '!text-gray-600 !bg-none !bg-gray-800',
      outline: '!text-gray-600 !border-gray-700',
    },
    secondary: {
      fill: '!text-gray-700 !bg-none !bg-gray-900',
      outline: '!text-gray-700 !border-gray-800',
    },
  };

  return disabledColorsDict[color][variant];
}
