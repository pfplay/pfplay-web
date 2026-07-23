'use client';

import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import InstallGuide from './install-guide.component';
import useInstallEnvironment from '../lib/use-install-environment.hook';

/**
 * 설치 안내 진입점. 이미 설치했거나(installed) 판정 전(null)이 아니면 노출한다 —
 * 네이티브 설치창이 없는 브라우저도 수동 안내로 이어주므로 숨기지 않는다.
 */
export default function useInstallGuide() {
  const t = useI18n();
  const environment = useInstallEnvironment();
  const { openDialog } = useDialog();

  const openInstallGuide = () =>
    openDialog((_, onCancel) => ({
      title: t.pwa.title,
      Body: () =>
        environment && onCancel ? (
          <InstallGuide environment={environment} onClose={onCancel} />
        ) : null,
    }));

  return {
    canInstall: environment !== null && environment !== 'installed',
    openInstallGuide,
  };
}
