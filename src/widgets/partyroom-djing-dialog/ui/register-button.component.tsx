import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';

export default function RegisterButton() {
  const t = useI18n();

  return <Button size='lg'>{t.dj.btn.register_queue}</Button>;
}
