import { AnnouncementSnapshot } from '../model/system-announcement.types';

export type Locale = 'ko' | 'en';

export function pickByLocale(values: { ko: string; en: string }, locale: Locale): string {
  return locale === 'ko' ? values.ko : values.en;
}

export function getLocalizedTitle(s: AnnouncementSnapshot, locale: Locale): string {
  return pickByLocale({ ko: s.titleKo, en: s.titleEn }, locale);
}

export function getLocalizedMessage(s: AnnouncementSnapshot, locale: Locale): string {
  return pickByLocale({ ko: s.messageKo, en: s.messageEn }, locale);
}

export function isExpired(s: AnnouncementSnapshot, nowMs = Date.now()): boolean {
  if (!s.expiresAt) return false;
  return new Date(s.expiresAt).getTime() <= nowMs;
}

export const isToast = (s: AnnouncementSnapshot) =>
  s.type === 'EVENT' && (s.severity === 'INFO' || s.severity === 'WARN');

export const isEmergencyBanner = (s: AnnouncementSnapshot) => s.type === 'EMERGENCY';

export const isPlannedNotice = (s: AnnouncementSnapshot) => s.type === 'MAINTENANCE_NOTICE';

/**
 * ISO 8601 ('2026-05-04T03:00:00') → 'YYYY-MM-DD HH:mm'.
 * 시간대 변환 없이 BE가 보낸 그대로 표시.
 */
export function formatScheduledTime(iso: string): string {
  return iso.slice(0, 16).replace('T', ' ');
}
