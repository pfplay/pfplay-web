import { useCallback, useEffect, useState } from 'react';

export type TabKey = 'chat' | 'crew' | 'queue';

const VALID_TABS: TabKey[] = ['chat', 'crew', 'queue'];

function readHashAsTab(): TabKey {
  if (typeof window === 'undefined') return 'chat';
  const raw = window.location.hash.replace('#', '');
  return (VALID_TABS as string[]).includes(raw) ? (raw as TabKey) : 'chat';
}

/**
 * 모바일 룸 탭 ↔ URL hash 양방향 sync.
 *
 * - SSR 안전: 초기 state 는 'chat'. mount 후 hash 읽어 정정.
 *   (SSR 시점에 window 없음 → 깜빡임 1프레임 수용. spec §4.2.1 결정.)
 * - 사용자 탭 클릭 → history 갱신 (chat = hash 제거, 그 외 = #<tab>).
 * - 뒤로/앞으로 (hashchange) → state 동기화.
 * - middleware 의 x-pf-device 헤더는 path 기반이라 hash 와 무충돌.
 */
export default function useTabHash() {
  const [activeTab, setActiveTabState] = useState<TabKey>('chat');

  useEffect(() => {
    setActiveTabState(readHashAsTab());
    const onHashChange = () => setActiveTabState(readHashAsTab());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const setActiveTab = useCallback((tab: TabKey) => {
    if (typeof window === 'undefined') return;
    // idempotence guard: URL 의 hash 가 이미 target 과 일치하면 pushState skip.
    // (invalid hash 'bogus' 는 readHashAsTab()=='chat' 이라도 URL hash 자체와 다르므로 정규화 발동)
    const currentHash = window.location.hash.replace('#', '');
    const targetHash = tab === 'chat' ? '' : tab;
    if (currentHash === targetHash) {
      setActiveTabState(tab);
      return;
    }
    if (tab === 'chat') {
      // 기본 탭은 hash 없는 상태로 정규화 (공유 링크 정합)
      const cleanPath = window.location.pathname + window.location.search;
      window.history.pushState(null, '', cleanPath);
    } else {
      window.history.pushState(null, '', `#${tab}`);
    }
    setActiveTabState(tab);
  }, []);

  return { activeTab, setActiveTab };
}
