# 모바일 폼 오버플로우 근본 차단 — 구현 계획

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 모바일 뷰포트(360px)에서 공용 폼·모달의 가로 오버플로우를 공용 `FormItem`을 브레이크포인트 반응형으로 만들어 근본 차단한다. 데스크탑은 불변.

**Architecture:** 주 작업은 공용 `FormItem`의 `horizontal` 레이아웃을 `tablet`(768px) 미만에서 세로 적층으로 자동 전환(CSS 브레이크포인트). 이후 각 모바일 폼/모달을 360px에서 실측해 잔여 오버플로우만 표면별로 보강하고, #394가 깔아둔 중복 per-form 핵을 정리한다.

**Tech Stack:** Next.js(App Router) · React · TypeScript · Tailwind(커스텀 screens: `tablet: 768px`) · vitest + @testing-library/react · Playwright(스크린샷 검증).

**스펙:** `docs/superpowers/specs/2026-06-09-mobile-form-overflow-design.md`
**브랜치:** `feature/mobile-form-overflow` (origin/development 분기)

---

## 공통 규약 (모든 Task)

- ⚠️ **하드 전제 — #394 머지+rebase 후 구현**: 본 브랜치를 #394 머지가 반영된 development 위로 rebase한 뒤 구현 시작. #394 미머지 상태로 `FormItem`을 손대면 #394의 `min-w-0` 변경과 충돌하는 diff가 난다. (스펙/플랜 문서만 선작성됨.)
- **순수 프론트엔드** — JDK 불필요. 명령은 레포 루트(`pfplay-web/`)에서.
- **테스트:** `yarn test src/<path>/<file>.test.tsx` (vitest run). **타입:** `yarn test:type`. **린트:** `yarn lint`.
- **브레이크포인트:** 모바일↔데스크탑 경계 = `tablet`(768px). 모바일 = `< tablet`(접두사 없는 기본값), 데스크탑 = `tablet:` 이상. **데스크탑 불변 = `tablet:` 이상 클래스가 현행과 동일**.
- **데스크탑 불변 원칙:** 모든 변경은 `tablet:` 게이트로 데스크탑(≥768px) 렌더를 바꾸지 않는다. 검증은 데스크탑 1440px 스크린샷 전/후 비교.
- **커밋:** Task별 1커밋. 메시지 한글, 푸터 `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`. lint-staged 자동 실행.
- **스크린샷 검증:** backend docker(:8080) + `npx next dev`(:3000, http/webpack — `yarn dev` 금지). 모바일 컨텍스트 360px + 데스크탑 1440px. 캡처 스크립트는 #394 머지 후 development에 포함된 `scripts/capture-mobile-screens.mjs`를 재사용하거나, 360/1440 폼 전용 캡처를 임시 작성(비커밋).

---

## File Structure

- **수정(주):** `src/shared/ui/components/form-item/form-item.component.tsx` — 컨테이너 grid·라벨 정렬·에러 스페이서를 `tablet:` 반응형으로.
- **수정(테스트):** `src/shared/ui/components/form-item/form-item.component.test.tsx` — 반응형 클래스 단언 추가.
- **조건부 수정(표면 스윕):** `src/features/bug-report/ui/bug-report-dialog.component.tsx`, `src/shared/ui/components/dialog/dialog.component.tsx` 등 — 실측 후 진짜 패널 오버플로우 남는 곳만.
- **조건부 정리(#394 핵):** `src/features/partyroom/create/lib/use-be-a-host.hook.tsx`, `src/entities/partyroom-info/ui/form.component.tsx`, `src/features-mobile/profile/ui/mobile-profile-edit-form.component.tsx` — 공용 수정이 덮음을 확인 후에만.

---

## Chunk 1: 반응형 FormItem (핵심)

### Task 1: `FormItem` horizontal 레이아웃 브레이크포인트 반응형

데스크탑 `horizontal`(라벨좌/입력우 2칼럼)을 `tablet` 미만에서 세로 단일칼럼으로 자동 전환. `layout='vertical'` 호출자와 데스크탑(≥tablet)은 불변.

**Files:**

- Modify: `src/shared/ui/components/form-item/form-item.component.tsx`
- Test: `src/shared/ui/components/form-item/form-item.component.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

`form-item.component.test.tsx`에 추가(기존 테스트·Typography mock 유지):

```tsx
describe('FormItem 반응형 레이아웃', () => {
  test('horizontal(기본): 모바일 단일칼럼 + tablet:부터 2칼럼 그리드', () => {
    const { container } = render(
      <FormItem label='이름'>
        <input />
      </FormItem>
    );
    const label = container.querySelector('label')!;
    // tablet: 이상에서만 2칼럼 → 모바일은 단일칼럼(stack)
    expect(label.className).toContain('tablet:grid-cols-[max-content_1fr]');
    // 접두사 없는 상시 2칼럼 클래스는 없어야(=모바일에서 2칼럼 강제 금지)
    expect(label.className).not.toMatch(/(^|\s)grid-cols-\[max-content_1fr\]/);
  });

  test('horizontal: 라벨 정렬이 모바일 text-start / tablet:text-right', () => {
    const { container } = render(
      <FormItem label='이름'>
        <input />
      </FormItem>
    );
    const labelText = container.querySelector('[data-custom-role="form-item-title"]')!;
    expect(labelText.className).toContain('text-start');
    expect(labelText.className).toContain('tablet:text-right');
  });

  test('vertical: 항상 세로(2칼럼 그리드 없음) + text-start, tablet:text-right 없음(불변)', () => {
    const { container } = render(
      <FormItem label='이름' layout='vertical'>
        <input />
      </FormItem>
    );
    const label = container.querySelector('label')!;
    expect(label.className).not.toContain('grid-cols-[max-content');
    const labelText = container.querySelector('[data-custom-role="form-item-title"]')!;
    expect(labelText.className).toContain('text-start');
    expect(labelText.className).not.toContain('tablet:text-right');
  });

  test('horizontal + error: 스페이서 div가 hidden tablet:block (모바일 빈 행 방지)', () => {
    const { container } = render(
      <FormItem label='이름' error='필수 항목입니다'>
        <input />
      </FormItem>
    );
    const spacer = Array.from(container.querySelectorAll('div')).find((d) =>
      d.className.includes('tablet:block')
    );
    expect(spacer).toBeTruthy();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `yarn test src/shared/ui/components/form-item/form-item.component.test.tsx`
Expected: FAIL — 현재 horizontal은 `grid-cols-[max-content_1fr]`(접두사 없음), 라벨은 `text-right`(text-start 없음), 스페이서는 `block`(tablet:block 아님).

- [ ] **Step 3: 구현 — 컨테이너 grid 반응형**

`form-item.component.tsx` 컨테이너 `<label>` className의 horizontal 분기를 `tablet:` 접두사로:

```tsx
className={cn([
  'grid gap-x-[16px] gap-y-[8px] items-center grid-rows-max auto-rows-max',
  layout === 'horizontal' && {
    'tablet:grid-cols-[max-content_1fr]': !fit,
    'tablet:grid-cols-[max-content_max-content]': fit,
  },
  classNames?.container,
])}
```

(모바일: grid-cols 미지정 → 단일칼럼 stack. tablet+: 현행 2칼럼. vertical: 변화 없음 — 원래 grid-cols 미지정.)

- [ ] **Step 4: 구현 — 라벨 정렬 반응형**

`labelTextStyle`의 horizontal 정렬을 `text-start tablet:text-right`로:

```tsx
const labelTextStyle = (layout: Axis, required?: boolean) => {
  return [
    'relative pr-[12px]',
    {
      'text-start text-gray-300': layout === 'vertical',
      'text-start tablet:text-right': layout === 'horizontal',
    },
    required &&
      'after:content-["*"] after:absolute after:-right-[0.33em] after:top-[0.8em] after:transform after:-translate-x-1/2 after:-translate-y-1/2 after:text-red-300',
  ];
};
```

(라벨 타이포 `type`(body2/detail2) 분기는 **변경 안 함** — 스펙 결정.)

- [ ] **Step 5: 구현 — 에러 스페이서 반응형**

에러 스페이서 `<div>`를 모바일에서 숨김:

```tsx
<div
  className={cn({
    hidden: layout === 'vertical',
    'hidden tablet:block': layout === 'horizontal',
  })}
/>
```

- [ ] **Step 6: 통과 확인**

Run: `yarn test src/shared/ui/components/form-item/form-item.component.test.tsx`
Expected: PASS (신규 4 + 기존 전부).

- [ ] **Step 7: 타입 + 린트**

Run: `yarn test:type && yarn lint`
Expected: 에러 0.

- [ ] **Step 8: 커밋**

```bash
git add src/shared/ui/components/form-item/form-item.component.tsx src/shared/ui/components/form-item/form-item.component.test.tsx
git commit -m "feat(폼): FormItem horizontal 레이아웃 tablet 반응형(모바일 세로/데스크탑 불변)"
```

---

### Chunk 1 검증 게이트

- [ ] `yarn test` 전체 GREEN · `yarn test:type` · `yarn lint` 클린
- [ ] plan-document-reviewer 통과 후 다음 Chunk (실행 시)

---

## Chunk 2: 증거 기반 표면 스윕 + 조건부 Dialog 클램프

> 각 표면은 **360px 실측 → 근본원인 확인 → (필요시) 수정 → 재검**. Chunk 1 + #394의 `min-w-0`로 이미 해소되면 "변경 없음(확인됨)"으로 기록하고 넘어간다. **무분별한 코드 추가 금지** — 진짜 잔여 오버플로우만 수정.

### Task 2: 생성 다이얼로그(Create Party) 360px 실측 + 정리 확인

**Files:** (실측용) `src/features/partyroom/create/...`, `src/entities/partyroom-info/ui/form.component.tsx`

- [ ] **Step 1: 360px 스크린샷** — dev-login(full)→로비→Create Party 다이얼로그 열기, 360px 뷰포트로 캡처. 가로 오버플로우(입력칸 잘림) 여부 확인.
- [ ] **Step 2: 판정** — Chunk1(세로 전환)+#394(min-w-0)로 오버플로우 0이면 "해소 확인"만 기록. 잔여 오버플로우 있으면 원인(어느 엘리먼트가 넘치는지) 특정.
- [ ] **Step 3: (조건부) 수정** — 잔여 시 해당 폼 컨테이너에 최소 수정(예: 특정 row `flex-wrap`/`min-w-0`). 데스크탑 불변 유지.
- [ ] **Step 4: 데스크탑 1440px 캡처** — 다이얼로그 레이아웃 현행과 동일 확인.
- [ ] **Step 5: (수정 시) 커밋** / 변경 없으면 다음 Task.

### Task 3: 버그신고 다이얼로그 360px 실측

**Files:** `src/features/bug-report/ui/bug-report-dialog.component.tsx`(`w-[480px]`)

- [ ] **Step 1: 360px 캡처** — Header 🐛 → 버그신고 모달. 패널이 뷰포트를 넘는지(패널 자체 오버플로우) 확인. (TextArea는 block이라 콘텐츠는 안전할 가능성.)
- [ ] **Step 2: 판정** — 패널 `w-[480px]`이 `max-w-full`로 클램프되어 360px에 들어오면 "해소 확인". 패널이 뷰포트를 넘으면 → Step 3.
- [ ] **Step 3: (조건부) Dialog 클램프** — 패널 오버플로우가 실재하면 **공용 `Dialog` 베이스**(`dialog.component.tsx` 패널 className)에 `max-w-[calc(100vw-2rem)]` 추가(모든 다이얼로그 일괄 안전, 데스크탑은 뷰포트가 넓어 무영향). 그 경우 Task 2의 생성 다이얼로그에도 동일 적용됨을 재검.
- [ ] **Step 4: 데스크탑 1440px 캡처** — 모달 현행 동일 확인.
- [ ] **Step 5: (수정 시) 커밋.**

### Task 4: 프로필·사인인·도메인 등 잔여 폼 360px 실측

**Files:** (실측) `src/features-mobile/profile/...`, `src/app/(auth)/sign-in/...`, 도메인 선택 컴포넌트, `src/features/edit-profile-bio/ui/v1.component.tsx`

- [ ] **Step 1: 각 표면 360px 캡처** — 모바일 프로필 폼, 사인인, 도메인 선택. 데스크탑 ProfileEditForm V1(`w-[550px]`)은 **모바일 라우트에서 도달 가능한지 먼저 확인**(도달 불가면 범위 제외 기록).
- [ ] **Step 2: 판정 + (조건부) 수정** — Chunk1으로 해소 안 되는 표면만 최소 수정. 사인인은 이미 `tablet:` 일부 사용 → 대개 자동 커버.
- [ ] **Step 3: 데스크탑 1440px 캡처** — 각 표면 현행 동일 확인.
- [ ] **Step 4: (수정 시) 커밋.**

---

### Chunk 2 검증 게이트

- [ ] 대상 표면 전부 360px에서 가로 오버플로우 0 (스크린샷 근거)
- [ ] 데스크탑 1440px 전부 현행 동일
- [ ] `yarn test`/`test:type`/`lint` 클린
- [ ] plan-document-reviewer 통과 후 다음 Chunk

---

## Chunk 3: #394 중복 핵 정리 + 최종 검증

### Task 5: #394 per-form 핵 정리 (표면별 검증 게이트)

> Chunk1(+#394 min-w-0)이 표면을 덮음을 Chunk2 스크린샷으로 이미 확인. 이제 중복 특수처리를 제거해 코드 더럽힘 회피. **각 핵 제거 후 그 표면 360px 재캡처로 회귀 0 확인.**

**Files:** `src/features/partyroom/create/lib/use-be-a-host.hook.tsx`, `src/entities/partyroom-info/ui/form.component.tsx`, `src/features-mobile/profile/ui/mobile-profile-edit-form.component.tsx`

- [ ] **Step 1: `use-be-a-host` 다이얼로그 `max-w`** — Dialog 베이스 클램프(있다면) 또는 Chunk1로 불필요해졌으면 제거. 제거 후 생성 다이얼로그 360px 재캡처 → 오버플로우 0 확인. (Dialog 클램프를 안 넣었고 이 max-w가 유일한 패널 가드면 남긴다.)
- [ ] **Step 2: 생성폼 `flex-wrap`** (`form.component.tsx` 도메인/제한 row) — Chunk1 세로 전환으로 불필요하면 제거, 재캡처 확인.
- [ ] **Step 3: `mobile-profile-edit-form layout='vertical'`** — FormItem이 모바일 자동 세로이므로 명시 prop 불필요 시 제거(단, 이 컴포넌트가 데스크탑에서도 렌더되면 데스크탑이 가로로 바뀌므로 **모바일 전용 렌더 여부 확인 후** 결정 — 모바일 전용이면 제거 안전, 공용이면 남김).
- [ ] **Step 4: 각 제거마다 모바일/데스크탑 재캡처로 회귀 0 확인.**
- [ ] **Step 5: 커밋** — `refactor(폼): FormItem 반응형으로 불필요해진 #394 per-form 오버플로우 핵 정리`

### Task 6: 최종 회귀 + 스크린샷 일괄

- [ ] **Step 1: 전체 단위테스트** — `yarn test` Expected: 전체 GREEN.
- [ ] **Step 2: 타입** — `yarn test:type` Expected: 0.
- [ ] **Step 3: 린트** — `yarn lint` Expected: 0.
- [ ] **Step 4: 모바일 360px 폼 일괄 캡처** — 전 대상 폼/모달 가로 오버플로우 0 육안.
- [ ] **Step 5: 데스크탑 1440px 일괄 캡처** — 전 대상 현행 불변 육안.
- [ ] **Step 6: 잔여 미커밋 없는지 `git status` 확인.**

---

### Chunk 3 검증 게이트

- [ ] 전체 test/type/lint GREEN · 모바일 오버플로우 0 · 데스크탑 불변
- [ ] plan-document-reviewer 통과 후 마감

---

## 미해결 → 후속

- dev 머지·prod 배포 = 사용자 게이트.
- ProfileEditForm V1이 모바일 도달 불가로 범위 제외됐다면, 추후 데스크탑 프로필 모바일화 시 별도 처리.

---

## 실행 핸드오프

저장 위치: `docs/superpowers/plans/2026-06-09-mobile-form-overflow.md`

**실행:** ⚠️ **#394 머지+rebase 후** subagent-driven-development로 Task별 진행(Task별 fresh subagent + 2단계 리뷰). Chunk 경계에서 검증 게이트 통과 후 다음.
