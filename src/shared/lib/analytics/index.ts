import type { EventName, EventPropertyMap, UserPropertyOps } from './events';

type AmplitudeModule = typeof import('@amplitude/analytics-browser');

let sdk: AmplitudeModule | null = null;
let sdkLoadPromise: Promise<AmplitudeModule> | null = null;
let pendingActions: Array<(sdk: AmplitudeModule) => void> = [];
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

function loadSdk(): Promise<AmplitudeModule> {
  if (sdkLoadPromise) return sdkLoadPromise;
  sdkLoadPromise = import('@amplitude/analytics-browser').then((mod) => {
    sdk = mod;
    const queue = pendingActions;
    pendingActions = [];
    queue.forEach((action) => action(mod));
    return mod;
  });
  return sdkLoadPromise;
}

function callSdk(action: (sdk: AmplitudeModule) => void): void {
  if (sdk) {
    action(sdk);
    return;
  }
  pendingActions.push(action);
  loadSdk();
}

export function initAnalytics(): void {
  const apiKey = getApiKey();
  if (!isClient() || !apiKey || initialized) return;
  initialized = true;
  callSdk((sdk) => {
    sdk.init(apiKey, undefined, {
      defaultTracking: false,
      autocapture: false,
    });
  });
}

export function track<E extends EventName>(event: E, properties?: EventPropertyMap[E]): void {
  if (!isEnabled()) return;
  callSdk((sdk) => {
    sdk.track(event, properties as Record<string, unknown> | undefined);
  });
}

export function setUserId(userId: string | null | undefined): void {
  if (!isEnabled()) return;
  callSdk((sdk) => {
    sdk.setUserId(userId ?? undefined);
  });
}

export function identify(ops: UserPropertyOps): void {
  if (!isEnabled()) return;

  callSdk((sdk) => {
    const id = new sdk.Identify();
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

    if (touched) sdk.identify(id);
  });
}

export function resetAnalyticsUser(): void {
  if (!isEnabled()) return;
  callSdk((sdk) => {
    sdk.reset();
  });
}

export function __resetForTests(): void {
  initialized = false;
  sdk = null;
  sdkLoadPromise = null;
  pendingActions = [];
}

/**
 * 테스트 환경에서 SDK를 동기적으로 주입한다. Vitest의 vi.mock이 hoist된
 * 모듈을 동적 import 보다 먼저 동기 가용 상태로 만들기 위해 사용.
 */
export function __preloadSdkForTests(mod: unknown): void {
  sdk = mod as AmplitudeModule;
  sdkLoadPromise = Promise.resolve(mod as AmplitudeModule);
}

export type { EventName, EventPropertyMap, UserPropertyOps } from './events';
