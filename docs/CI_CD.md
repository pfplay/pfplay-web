# CI/CD 워크플로우

> Last Update (26.04.25)

GitHub Actions 워크플로우 5개로 구성되며, 브랜치 및 이벤트 종류에 따라 실행 여부가 결정됩니다.

---

## 워크플로우 목록

| 파일                     | 이름               | 트리거                          |
| ------------------------ | ------------------ | ------------------------------- |
| `lint-check.yml`         | lint check         | 모든 PR                         |
| `vercel-build-check.yml` | vercel build check | `development`, `main` 대상 PR   |
| `vercel-preview.yml`     | vercel preview     | `development` 브랜치 push       |
| `vercel-production.yml`  | vercel production  | `main` 브랜치 push              |
| `e2e.yml`                | E2E Tests          | Vercel deployment_status 이벤트 |

---

## 브랜치별 흐름

### feature 브랜치

```
feature 브랜치 작업
│
├─ [push]
│   └── Vercel GitHub App: feature Preview 자동 배포
│       └── deployment_status 이벤트 → e2e 조건 불충족 (스킵)
│           이유: target_url에 'git-development' 미포함
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
└─ Vercel GitHub App: development Preview 자동 배포
    └── deployment_status 이벤트 발행
        └── e2e 조건 검사
            ├── state == 'success' ✅
            ├── target_url contains 'git-development' ✅
            └── target_url contains 'dev-8226s-projects' ✅
                → e2e ✅ (E2E_BASE_URL: https://stg.pfplay.xyz)
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
└─ Vercel GitHub App: Production 자동 배포
    └── deployment_status 이벤트 발행
        └── e2e 조건 검사
            └── target_url에 'git-development' 미포함 → e2e 스킵 ✅
```

**실행되는 워크플로우:** vercel-production

---

## e2e 실행 조건 상세

e2e는 `deployment_status` 이벤트 기반으로 동작합니다.

```yaml
if: >
  github.event.deployment_status.state == 'success' &&
  contains(github.event.deployment_status.target_url, 'git-development') &&
  contains(github.event.deployment_status.target_url, 'dev-8226s-projects')
```

| 조건                                  | 의미                           |
| ------------------------------------- | ------------------------------ |
| `state == 'success'`                  | 배포 완료 후에만 실행          |
| `contains(..., 'git-development')`    | development 브랜치 배포만 대상 |
| `contains(..., 'dev-8226s-projects')` | 올바른 Vercel 계정 배포만 대상 |

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
