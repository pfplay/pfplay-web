import * as amplitude from '@amplitude/analytics-browser';

import type { EventName, EventPropertyMap, UserPropertyOps } from './events';

let initialized = false;

function getApiKey(): string | undefined {
  return process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
}

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function isEnabled(): boolean {
  return isClient() && Boolean(getApiKey());
}

export function initAnalytics(): void {
  const apiKey = getApiKey();
  if (!isClient() || !apiKey || initialized) return;

  amplitude.init(apiKey, undefined, {
    defaultTracking: false,
    autocapture: false,
  });
  initialized = true;
}

export function track<E extends EventName>(event: E, properties?: EventPropertyMap[E]): void {
  if (!isEnabled()) return;
  amplitude.track(event, properties as Record<string, unknown> | undefined);
}

export function setUserId(userId: string | null | undefined): void {
  if (!isEnabled()) return;
  amplitude.setUserId(userId ?? undefined);
}

export function identify(ops: UserPropertyOps): void {
  if (!isEnabled()) return;

  const id = new amplitude.Identify();
  let touched = false;

  for (const [key, value] of Object.entries(ops.set ?? {})) {
    if (value === undefined) continue;
    id.set(key, value as string | number | boolean);
    touched = true;
  }
  for (const [key, value] of Object.entries(ops.setOnce ?? {})) {
    if (value === undefined) continue;
    id.setOnce(key, value as string | number | boolean);
    touched = true;
  }
  for (const [key, value] of Object.entries(ops.add ?? {})) {
    if (value === undefined) continue;
    id.add(key, value as number);
    touched = true;
  }

  if (touched) amplitude.identify(id);
}

export function resetAnalyticsUser(): void {
  if (!isEnabled()) return;
  amplitude.reset();
}

export function __resetForTests(): void {
  initialized = false;
}

export type { EventName, EventPropertyMap, UserPropertyOps } from './events';
