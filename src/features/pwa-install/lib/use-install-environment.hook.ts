'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { isStandalone } from '@/shared/lib/browser/browser-environment';
import { installEnvironment, InstallEnvironment } from './install-environment';
import { hasInstallPrompt, subscribeInstallPrompt } from './install-prompt';

/**
 * 지금 브라우저에 어떤 설치 안내를 보여줘야 하는지.
 *
 * userAgent·standalone 은 클라이언트에만 있으므로 마운트 후에 계산한다.
 * 서버 렌더와 첫 페인트에서는 'unsupported' — 진입점이 잠깐 보였다 사라지는 것보다
 * 늦게 나타나는 편이 낫다.
 */
export default function useInstallEnvironment(): InstallEnvironment {
  const promptAvailable = useSyncExternalStore(
    subscribeInstallPrompt,
    hasInstallPrompt,
    () => false
  );
  const [environment, setEnvironment] = useState<InstallEnvironment>('unsupported');

  useEffect(() => {
    setEnvironment(
      installEnvironment({
        userAgent: navigator.userAgent,
        standalone: isStandalone(),
        hasInstallPrompt: promptAvailable,
      })
    );
  }, [promptAvailable]);

  return environment;
}
