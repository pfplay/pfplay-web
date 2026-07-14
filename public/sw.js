// pfplay PWA service worker — 캐싱 없음(앱이 realtime-heavy → stale 방지).
// 책임: (1) 설치 가능성 충족용 no-op fetch, (2) Web Push 수신·표시.
// 라이브 데이터는 항상 네트워크/WS. 앱셸/API 캐싱 금지.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// no-op: 응답을 가로채지 않음 → 캐싱/셸 서빙 없음, 점검모드 게이팅과 무충돌.
// (빈 핸들러여도 일부 브라우저는 설치 프롬프트에 fetch 리스너 존재를 요구 — 지우지 말 것.)
self.addEventListener('fetch', () => {});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'PFPlay', body: event.data.text() };
  }
  const title = payload.title || 'PFPlay';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/icons/pwa-192x192.png',
    badge: '/icons/pwa-192x192.png',
    data: { url: payload.url || '/' },
    tag: payload.tag,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = new URL(
    (event.notification.data && event.notification.data.url) || '/',
    self.location.origin
  ).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        // 이미 같은 URL이면 재네비게이트 금지 — realtime 앱 reload로 WS/룸 상태 유실 방지.
        if (client.url === targetUrl) return client.focus();
        if ('navigate' in client) {
          return client.navigate(targetUrl).then((c) => (c || client).focus());
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
