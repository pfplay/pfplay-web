'use client';

import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import InstallGuide from './install-guide.component';
import useInstallEnvironment from '../lib/use-install-environment.hook';

/**
 * 설치 안내 진입점. `canInstall` 이 false 면 메뉴 항목 자체를 노출하지 않는다 —
 * 이미 설치했거나(installed) 설치라는 개념이 없는 환경(unsupported)에서는 보여줄 게 없다.
 */
export default function useInstallGuide() {
  const t = useI18n();
  const environment = useInstallEnvironment();
  const { openDialog } = useDialog();

  const openInstallGuide = () =>
    openDialog((_, onCancel) => ({
      title: t.pwa.title,
      Body: () => (onCancel ? <InstallGuide environment={environment} onClose={onCancel} /> : null),
    }));

  return {
    canInstall: environment !== 'installed' && environment !== 'unsupported',
    openInstallGuide,
  };
}
