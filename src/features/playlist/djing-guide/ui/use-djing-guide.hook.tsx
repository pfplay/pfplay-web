import { useUserPreferenceStore } from '@/entities/preference';
import { Preference } from '@/entities/preference/model/user-preference.model';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import DjingGuideLayout from './layout.component';

export default function useDjingGuide() {
  const t = useI18n();
  const djingGuideHidden = useUserPreferenceStore((s: Preference.Model) => s.djingGuideHidden);
  const { openDialog } = useDialog();

  const openDjingGuideModal = () => {
    return openDialog((_, onCancel) => ({
      title: t.dj.title.rule_guide,
      Body: () => onCancel && <DjingGuideLayout onClose={onCancel} />,
      classNames: {
        container: 'w-[596px]',
      },
    }));
  };

  return { showDjingGuide: !djingGuideHidden, openDjingGuideModal };
}
