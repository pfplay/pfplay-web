# ADR-003: FSD barrel export를 `index.ts` / `index.ui.ts`로 분리

- **상태**: 채택됨
- **일자**: 2024-10

## 맥락

Next.js App Router에서 서버 컴포넌트와 클라이언트 컴포넌트가 공존한다. FSD 모듈의 `index.ts`에 순수 함수와 React 컴포넌트(`'use client'`)를 함께 export하면, 서버 사이드에서 import할 때 클라이언트 코드가 번들에 끌려 들어온다.

```tsx
// 이 import는 서버에서 Crew.Permission만 필요하지만,
// index.ts에 있는 useOpenGradeAdjustmentAlertDialog('use client')도 포함됨
import { Crew } from '@/entities/current-partyroom';
```

## 선택지

| 선택지                               | 장점                      | 단점                                 |
| ------------------------------------ | ------------------------- | ------------------------------------ |
| 모든 export를 `index.ts` 하나로      | 단순                      | SSR에서 클라이언트 코드 혼입         |
| **`index.ts` + `index.ui.ts` 분리**  | 서버/클라이언트 경계 명확 | import 컨벤션 학습 필요              |
| barrel export 포기, 직접 경로 import | 혼입 없음                 | 모듈 경계 무력화, import 경로 산발적 |

## 결정

**`index.ts`(로직/모델)와 `index.ui.ts`(React 컴포넌트)를 분리**한다.

- 서버 컴포넌트/순수 로직에서는 `@/entities/me` (index.ts)
- 클라이언트 컴포넌트에서는 `@/entities/me/index.ui` (index.ui.ts)

### 적용된 모듈

- `src/entities/me/index.ts` + `src/entities/me/index.ui.ts`
- `src/entities/current-partyroom/index.ts` + `index.ui.ts`
- `src/shared/ui/components/dialog/index.ts` 등

## 결과

- **(+)** 서버/클라이언트 경계 명확 — 빌드 경고 제거
- **(+)** tree-shaking에 유리
- **(-)** import 경로 컨벤션(`index.ui`)을 팀원이 숙지해야 함
- **(-)** 새 모듈 생성 시 두 파일을 관리해야 하는 오버헤드
