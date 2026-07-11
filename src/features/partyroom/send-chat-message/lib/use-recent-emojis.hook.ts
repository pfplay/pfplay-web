'use client';
import { useEffect, useState } from 'react';

export const RECENT_EMOJIS_STORAGE_KEY = 'pfplay:chat:recent-emojis';
const MAX_RECENTS = 8;

function loadRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_EMOJIS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === 'string').slice(0, MAX_RECENTS);
  } catch {
    return [];
  }
}

/**
 * 채팅 이모지 최근 사용 MRU (#439).
 * SSR/hydration 안전: 초기 [] → 마운트 후 로드. localStorage 불가 환경은 메모리로만 동작.
 */
export default function useRecentEmojis() {
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    setRecents(loadRecents());
  }, []);

  const addRecent = (emoji: string) => {
    // updater 내부 부수효과 금지(StrictMode 이중 호출) — next를 밖에서 계산해 저장
    const next = [emoji, ...recents.filter((e) => e !== emoji)].slice(0, MAX_RECENTS);
    try {
      localStorage.setItem(RECENT_EMOJIS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // 프라이빗 모드 등 저장 불가 환경 — 세션 메모리로만 유지
    }
    setRecents(next);
  };

  return { recents, addRecent };
}
