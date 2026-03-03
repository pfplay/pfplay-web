# ADR-011: FSD 레이어 간 import 경계 강제 방안

- **상태**: 미결정
- **일자**: 2026-03-03

## 맥락

FSD 아키텍처의 핵심 규칙은 **상위 레이어만 하위 레이어를 import할 수 있다**는 것이다:

```
app → widgets → features → entities → shared  (허용)
shared → entities  (위반)
features → features  (위반)
entities → features  (위반)
```

현재 ESLint 커스텀 룰 2개가 있지만, 레이어 간 의존 방향은 검증하지 않는다:

- `no-direct-service-method-reference` — React Query 내 서비스 호출 패턴
- `no-absolute-import-without-prefix` — `@/` 접두사 강제

프로젝트 규모가 커지면 의존 방향 위반이 누적되어 아키텍처가 무력화된다.

## 선택지

| 선택지                                   | 장점                    | 단점                                       |
| ---------------------------------------- | ----------------------- | ------------------------------------------ |
| **eslint-plugin-boundaries**             | FSD 전용 설정 예시 풍부 | 외부 의존성 추가                           |
| ESLint `no-restricted-imports` 수동 설정 | 의존성 없음             | 레이어 조합별 수동 나열, 유지보수 번거로움 |
| 자체 ESLint 플러그인 확장                | 기존 커스텀 룰과 일관   | 개발 비용                                  |
| Dependency Cruiser                       | 시각화 + 검증           | CI 통합 별도, 실시간 피드백 없음           |

## 결정

> 미결정 — 도구 선정 및 규칙 범위 결정 필요

## 도입 시 고려사항

- 기존 위반 사례가 있을 수 있으므로, 먼저 `warn`으로 도입 후 점진적으로 `error`로 전환
- `index.ui.ts` 분리 패턴(ADR-003)과의 정합성 확인
- 같은 레이어 내 cross-slice import 허용 범위 결정 (예: `entities/me` → `entities/wallet` 허용 여부)
