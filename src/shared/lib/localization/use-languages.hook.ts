import { useLang } from '@/shared/lib/localization/lang.context';
import { Language } from './constants';
import { useI18n } from './i18n.context';

export default function useLanguages() {
  const t = useI18n();
  const lang = useLang();

  return [
    {
      label: t.common.btn.eng,
      value: Language.En,
      isCurrent: lang === Language.En,
    },
    {
      label: t.common.btn.kor,
      value: Language.Ko,
      isCurrent: lang === Language.Ko,
    },
  ];
}
