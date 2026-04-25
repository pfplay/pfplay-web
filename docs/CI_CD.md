# CI/CD 워크플로우

> Last Update (26.04.25)

GitHub Actions 워크플로우 5개로 구성되며, 브랜치 및 이벤트 종류에 따라 실행 여부가 결정됩니다.

---

## 워크플로우 목록

| 파일                     | 이름               | 트리거                         |
| ------------------------ | ------------------ | ------------------------------ |
| `lint-check.yml`         | lint check         | 모든 PR                        |
| `vercel-build-check.yml` | vercel build check | `development`, `main` 대상 PR  |
| `vercel-preview.yml`     | vercel preview     | `development` 브랜치 push      |
| `vercel-production.yml`  | vercel production  | `main` 브랜치 push             |
| `e2e.yml`                | E2E Tests          | `vercel preview` workflow 완료 |

---

## 브랜치별 흐름

### feature 브랜치

```
feature 브랜치 작업
│
├─ [push]
│   └── Vercel GitHub App: feature Preview 자동 배포
│       └── e2e와 무관
│           이유: e2e는 `vercel preview` workflow_run만 구독
│
└─ [PR → development 오픈]
    ├── lint-check ✅
    └── vercel-build-check ✅
```

**실행되는 워크플로우:** lint-check, vercel-build-check (PR 오픈 시)

---

### development 브랜치

```
feature → development PR 머지 (또는 직접 push)
│
├─ vercel-preview ✅
│   └── CLI로 Vercel Preview 배포 → stg.pfplay.xyz 업데이트
│
└─ e2e ✅
    └── `vercel preview` workflow 완료 후 workflow_run으로 실행
        ├── conclusion == success ✅
        ├── branches == development ✅
        └── checkout ref == workflow_run.head_sha ✅
            → E2E_BASE_URL: https://stg.pfplay.xyz
```

**실행되는 워크플로우:** vercel-preview, e2e

> **참고:** `vercel-preview`(CLI)와 Vercel GitHub App이 동시에 배포를 실행해 development push마다 Vercel 배포가 2회 발생합니다.

---

### main 브랜치

```
development → main PR 머지 (또는 직접 push)
│
├─ vercel-production ✅
│   └── CLI로 Vercel Production 배포
│
└─ e2e 미실행
    └── `vercel preview`가 main에서 돌지 않으므로 workflow_run 미발생
```

**실행되는 워크플로우:** vercel-production

---

## e2e 실행 조건 상세

e2e는 `workflow_run` 이벤트 기반으로 동작합니다.

```yaml
on:
  workflow_run:
    workflows: ['vercel preview']
    types: [completed]
    branches: [development]

jobs:
  e2e:
    if: github.event.workflow_run.conclusion == 'success'
```

| 조건                                   | 의미                                         |
| -------------------------------------- | -------------------------------------------- |
| `workflows: ['vercel preview']`        | preview 배포 워크플로우 완료 후에만 실행     |
| `branches: [development]`              | development 브랜치에서 실행된 preview만 대상 |
| `conclusion == 'success'`              | preview 배포 성공 시에만 실행                |
| `checkout ref = workflow_run.head_sha` | preview를 트리거한 정확한 커밋을 테스트      |

**E2E_BASE_URL이 `https://stg.pfplay.xyz`로 고정된 이유:**
백엔드 스테이징 서버가 `stg.pfplay.xyz` origin만 허용합니다. feature 브랜치의 Vercel Preview URL(`*.vercel.app`)은 CORS 차단으로 API 호출이 불가합니다.

---

## 필요한 설정값

### Vercel

| 계정               | 프로젝트   | 설정                                                                       |
| ------------------ | ---------- | -------------------------------------------------------------------------- |
| dev-8226s-projects | pfplay-web | GitHub App 연동, `NEXT_PUBLIC_ENABLE_DEV_LOGIN=true` (Preview 환경변수)    |
| dev-8226s-projects | pfplay-web | Settings → Deployment Protection → Protection Bypass for Automation 활성화 |

### GitHub

| 위치                                            | 키                                | 값                              |
| ----------------------------------------------- | --------------------------------- | ------------------------------- |
| Environments → `Preview – pfplay-web` → Secrets | `VERCEL_AUTOMATION_BYPASS_SECRET` | Vercel Protection Bypass secret |
| Secrets → Repository                            | `VERCEL_TOKEN`                    | Vercel CLI 배포용 토큰          |
