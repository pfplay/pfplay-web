import useLanguages from '@/shared/lib/localization/use-languages.hook';
import { IconMenu } from '@/shared/ui/components/icon-menu';
import { PFLanguage } from '@/shared/ui/icons';
import { useChangeLanguage } from './use-change-language.hook';

export default function LanguageChangeMenu() {
  const languages = useLanguages();
  const changeLanguage = useChangeLanguage();

  return (
    <IconMenu
      MenuButtonIcon={<PFLanguage />}
      menuItemPanel={{ size: 'sm' }}
      menuItemConfig={languages.map((lang) => ({
        label: lang.label,
        onClickItem: () => changeLanguage(lang.value),
      }))}
    />
  );
}
