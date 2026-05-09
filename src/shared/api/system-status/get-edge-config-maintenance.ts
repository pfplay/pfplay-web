import { get } from '@vercel/edge-config';
import { MaintenanceState } from '@/features/system-announcement/model/system-announcement.types';

/**
 * 점검 모드 인지의 1차 source. **server-only** — middleware.ts 또는
 * server component 에서만 호출. client component import 금지 (`EDGE_CONFIG`
 * 토큰이 client bundle 에 노출되면 안 됨).
 *
 * - `EDGE_CONFIG` 환경변수가 없으면(로컬 dev 등) 즉시 null 반환 — get 호출 안 함
 * - get 호출 자체가 throw 해도 silent 하게 null 반환 — REST/503 인터셉터로 fallback
 *
 * Hobby plan 은 account 당 Edge Config 인스턴스 1개라 prod/preview/dev 가
 * 단일 인스턴스를 공유. 환경 격리는 key 분기로 처리:
 *   production  → 'maintenance'
 *   preview     → 'maintenance_preview'
 *   development → 'maintenance_development'
 *   undefined (로컬 next dev) → EDGE_CONFIG 부재로 위에서 이미 null 반환
 */
function resolveMaintenanceKey(): string {
  // 빈 문자열도 미설정으로 간주 (`??` 대신 `||`)
  const env = process.env.VERCEL_ENV || 'development';
  return env === 'production' ? 'maintenance' : `maintenance_${env}`;
}

export async function getEdgeConfigMaintenance(): Promise<MaintenanceState | null> {
  if (!process.env.EDGE_CONFIG) return null;
  try {
    const value = await get<MaintenanceState | null>(resolveMaintenanceKey());
    return value ?? null;
  } catch {
    return null;
  }
}
