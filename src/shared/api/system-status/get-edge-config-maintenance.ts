import { get } from '@vercel/edge-config';
import { MaintenanceState } from '@/features/system-announcement/model/system-announcement.types';

/**
 * 점검 모드 인지의 1차 source. **server-only** — middleware.ts 또는
 * server component 에서만 호출. client component import 금지 (`EDGE_CONFIG`
 * 토큰이 client bundle 에 노출되면 안 됨).
 *
 * - `EDGE_CONFIG` 환경변수가 없으면(로컬 dev 등) 즉시 null 반환 — get 호출 안 함
 * - get 호출 자체가 throw 해도 silent 하게 null 반환 — REST/503 인터셉터로 fallback
 */
export async function getEdgeConfigMaintenance(): Promise<MaintenanceState | null> {
  if (!process.env.EDGE_CONFIG) return null;
  try {
    const value = await get<MaintenanceState | null>('maintenance');
    return value ?? null;
  } catch {
    return null;
  }
}
