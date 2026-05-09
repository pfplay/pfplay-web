import { SystemStatusResponse, SystemStatusResult } from './types';

const API_HOST = process.env.NEXT_PUBLIC_API_HOST_NAME ?? '';

/**
 * Edge Config 가 unreachable 한 경우의 1차 fallback.
 * 응답은 short-TTL public cache 를 의도하여 `revalidate: 10s` 적용.
 */
export async function getSystemStatus(): Promise<SystemStatusResult> {
  const res = await fetch(`${API_HOST}v1/system/status`, {
    next: { revalidate: 10 },
  });
  if (!res.ok) throw new Error(`system-status: HTTP ${res.status}`);
  const json = (await res.json()) as SystemStatusResponse;
  return json.result;
}
