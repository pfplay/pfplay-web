'use client';

import { useCallback, useEffect, useState } from 'react';
import { pushService } from '@/shared/api/http/services';
import { clientEnv } from '@/shared/config';
import { useLang } from '@/shared/lib/localization/lang.context';
import {
  iosNeedsInstall,
  isPushSupported,
  isStandalone,
  normalizeLang,
  urlBase64ToUint8Array,
} from './push-support';

export type PushStatus = 'unsupported' | 'needs-install' | 'denied' | 'off' | 'on' | 'pending';

async function getRegistration(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.ready;
}

/**
 * Web Push 구독 상태/토글 훅.
 * 브라우저 API 접근은 전부 SSR 가드(`isPushSupported`) 뒤에서 수행.
 */
export default function usePushSubscription() {
  const lang = useLang();
  const [status, setStatus] = useState<PushStatus>('pending');

  // 초기 status 계산
  useEffect(() => {
    let cancelled = false;

    const resolve = async (): Promise<PushStatus> => {
      if (!isPushSupported()) return 'unsupported';
      if (iosNeedsInstall(navigator.userAgent, isStandalone())) return 'needs-install';
      if (Notification.permission === 'denied') return 'denied';

      const reg = await getRegistration();
      const sub = await reg.pushManager.getSubscription();
      return sub ? 'on' : 'off';
    };

    resolve()
      .then((next) => {
        if (!cancelled) setStatus(next);
      })
      .catch((error) => {
        console.error('[push] 초기 상태 확인 실패', error);
        if (!cancelled) setStatus('off');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const enable = useCallback(async () => {
    if (!isPushSupported()) {
      setStatus('unsupported');
      return;
    }
    if (iosNeedsInstall(navigator.userAgent, isStandalone())) {
      setStatus('needs-install');
      return;
    }

    const vapidKey = clientEnv.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      // VAPID 키 미설정 환경 → 구독 불가. 토글은 비활성으로 둔다.
      setStatus('unsupported');
      return;
    }

    setStatus('pending');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('denied');
        return;
      }

      const reg = await getRegistration();
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const { keys } = sub.toJSON();
      await pushService.subscribe({
        endpoint: sub.endpoint,
        p256dh: keys?.p256dh ?? '',
        auth: keys?.auth ?? '',
        lang: normalizeLang(lang),
      });

      setStatus('on');
    } catch (error) {
      console.error('[push] 구독 활성화 실패', error);
      setStatus(Notification.permission === 'denied' ? 'denied' : 'off');
    }
  }, [lang]);

  const disable = useCallback(async () => {
    if (!isPushSupported()) {
      setStatus('unsupported');
      return;
    }

    setStatus('pending');
    try {
      const reg = await getRegistration();
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await pushService.unsubscribe({ endpoint: sub.endpoint });
      }
      setStatus('off');
    } catch (error) {
      console.error('[push] 구독 해제 실패', error);
      setStatus('off');
    }
  }, []);

  return { status, enable, disable };
}
