import IconMenu from '@/shared/ui/components/icon-menu/icon-menu.component';
import { PFLanguage } from '@/shared/ui/icons';
import { Language } from '../config/constants';
import { useDictionary } from '../lib/dictionary.context';
import { useChangeLanguage } from '../lib/use-change-language.hook';

export default function LanguageChangeMenu() {
  const dic = useDictionary();
  const changeLanguage = useChangeLanguage();

  return (
    <IconMenu
      MenuButtonIcon={<PFLanguage />}
      menuItemPanel={{ size: 'sm' }}
      menuItemConfig={[
        {
          label: dic['common.btn.eng'],
          onClickItem: () => changeLanguage(Language.En),
        },
        {
          label: dic['common.btn.kor'],
          onClickItem: () => changeLanguage(Language.Ko),
        },
      ]}
    />
  );
}
