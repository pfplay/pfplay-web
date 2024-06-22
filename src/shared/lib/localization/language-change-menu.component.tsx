import { IconMenu } from '@/shared/ui/components/icon-menu';
import { PFLanguage } from '@/shared/ui/icons';
import { useI18n } from 'shared/lib/localization/i18n.context';
import { Language } from './constants';
import { useChangeLanguage } from './use-change-language.hook';

export default function LanguageChangeMenu() {
  const t = useI18n();
  const changeLanguage = useChangeLanguage();

  return (
    <IconMenu
      MenuButtonIcon={<PFLanguage />}
      menuItemPanel={{ size: 'sm' }}
      menuItemConfig={[
        {
          label: t.common.btn.eng,
          onClickItem: () => changeLanguage(Language.En),
        },
        {
          label: t.common.btn.kor,
          onClickItem: () => changeLanguage(Language.Ko),
        },
      ]}
    />
  );
}
