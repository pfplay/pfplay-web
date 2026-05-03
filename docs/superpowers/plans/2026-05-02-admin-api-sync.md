# Admin API Sync Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sync admin API additions into the service frontend by aligning ErrorCode enum (CRW-003, CRW-004) and adding a user-facing alert for CRW-004 (incomplete profile).

**Architecture:** Two narrow surface changes. (1) Hand-align `ErrorCode` enum in `src/shared/api/http/types/@shared.ts` to match the backend OpenAPI spec. (2) Add a single `useOnError(ErrorCode.PROFILE_REQUIRED, ...)` handler in the existing `usePartyroomEnterErrorAlerts` hook so the user sees a friendly alert when the backend rejects partyroom entry due to incomplete profile. i18n key added via the standard xlsx → json codegen workflow.

**Tech Stack:** TypeScript, Next.js (App Router), Vitest, ExcelJS (i18n source), existing in-house dialog and i18n hooks.

**Spec:** `docs/superpowers/specs/2026-05-02-admin-api-sync-design.md`

---

## File Map

| File                                                                        | Action            | Responsibility                                          |
| --------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------- |
| `src/shared/api/http/types/@shared.ts`                                      | Modify            | ErrorCode enum: add CRW-003, CRW-004                    |
| `scripts/i18n.xlsx`                                                         | Modify            | Add `partyroom.ec.profile_required` row (key + ko + en) |
| `src/shared/lib/localization/dictionaries/ko.json`                          | Regenerate (auto) | i18n output (do not hand-edit)                          |
| `src/shared/lib/localization/dictionaries/en.json`                          | Regenerate (auto) | i18n output (do not hand-edit)                          |
| `src/features/partyroom/enter/lib/use-partyroom-enter-error-alerts.ts`      | Modify            | Add `PROFILE_REQUIRED` handler                          |
| `src/features/partyroom/enter/lib/use-partyroom-enter-error-alerts.test.ts` | Modify            | Update count assertion + add CRW-004 behavior test      |

No new files created. Mounted location (`src/app/parties/layout.tsx:42`) unchanged.

---

## Chunk 1: Foundation alignment

### Task 1: ErrorCode enum 정렬

**Files:**

- Modify: `src/shared/api/http/types/@shared.ts:15-17`

- [ ] **Step 1: Add CRW-003, CRW-004 enum entries**

Edit the `// CrewException` block in `src/shared/api/http/types/@shared.ts`. Currently:

```ts
  // CrewException
  NOT_FOUND_ACTIVE_ROOM = 'CRW-001', // 내 활성화된 방을 찾을 수 없음
  INVALID_ACTIVE_ROOM = 'CRW-002', // 내 활성화된 방이 유효하지 않음
```

Change to:

```ts
  // CrewException
  NOT_FOUND_ACTIVE_ROOM = 'CRW-001', // 내 활성화된 방을 찾을 수 없음
  INVALID_ACTIVE_ROOM = 'CRW-002', // 내 활성화된 방이 유효하지 않음
  NOT_PARTYROOM_CREW = 'CRW-003', // 파티룸의 크루가 아닙니다
  PROFILE_REQUIRED = 'CRW-004', // 프로필 등록이 완료되어야 파티룸에 참여할 수 있습니다
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `JAVA_HOME="C:/Users/Eisen/.jdks/ms-21.0.7" yarn test:type`
Expected: PASS (enum addition cannot break callers)

> Note: `JAVA_HOME` prefix is not needed for `yarn test:type`; included only as the user's Gradle/JDK convention reminder. For TypeScript only: `yarn test:type` is sufficient.

Run: `yarn test:type`
Expected: PASS

---

### Task 2: i18n 키 추가 (xlsx)

**Files:**

- Modify: `scripts/i18n.xlsx` (key `partyroom.ec.profile_required`, ko + en)
- Regenerate: `src/shared/lib/localization/dictionaries/{ko,en}.json` via `yarn i18n`

Existing xlsx column convention (from `scripts/i18n.js:9-12`): C=key, D=ko, E=en, data starts at row 4. Existing keys live somewhere in the same sheet — the new row is appended after the last data row.

- [ ] **Step 1: Append a row to scripts/i18n.xlsx programmatically**

Run from project root:

```powershell
node -e "const ExcelJS=require('exceljs'); const wb=new ExcelJS.Workbook(); wb.xlsx.readFile('./scripts/i18n.xlsx').then(async()=>{const ws=wb.getWorksheet('i18n'); const lastRow=ws.lastRow.number; const r=ws.getRow(lastRow+1); r.getCell('C').value='partyroom.ec.profile_required'; r.getCell('D').value='프로필 등록을 완료해야 파티룸에 참여할 수 있어요'; r.getCell('E').value='Complete your profile setup to join a partyroom.'; r.commit(); await wb.xlsx.writeFile('./scripts/i18n.xlsx'); console.log('appended at row',lastRow+1);});"
```

Expected output: `appended at row N` (N = previous lastRow + 1).

If a row with key `partyroom.ec.profile_required` already exists (e.g., re-running this step), the script will append a duplicate. Before running, verify uniqueness with:

```powershell
node -e "const ExcelJS=require('exceljs'); const wb=new ExcelJS.Workbook(); wb.xlsx.readFile('./scripts/i18n.xlsx').then(()=>{const ws=wb.getWorksheet('i18n'); ws.getColumn('C').eachCell((c,r)=>{if(c.text==='partyroom.ec.profile_required')console.log('exists at row',r);});});"
```

If output is empty → safe to append. If output reports a row → skip Step 1.

- [ ] **Step 2: Regenerate ko.json / en.json**

Run: `yarn i18n`
Expected: no output, both `dictionaries/ko.json` and `dictionaries/en.json` updated.

- [ ] **Step 3: Verify the key landed**

Run:

```powershell
node -e "const k=require('./src/shared/lib/localization/dictionaries/ko.json').partyroom.ec.profile_required; const e=require('./src/shared/lib/localization/dictionaries/en.json').partyroom.ec.profile_required; console.log('ko:',k); console.log('en:',e);"
```

Expected:

```
ko: 프로필 등록을 완료해야 파티룸에 참여할 수 있어요
en: Complete your profile setup to join a partyroom.
```

- [ ] **Step 4: Commit foundation chunk**

```bash
git add src/shared/api/http/types/@shared.ts scripts/i18n.xlsx src/shared/lib/localization/dictionaries/ko.json src/shared/lib/localization/dictionaries/en.json
git commit -m "$(cat <<'EOF'
chore: align ErrorCode enum and add profile_required i18n for CRW-004

- Add CRW-003 (NOT_PARTYROOM_CREW), CRW-004 (PROFILE_REQUIRED) to ErrorCode
- Add partyroom.ec.profile_required ko/en copy

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Chunk 2: CRW-004 alert handler (TDD)

### Task 3: Failing test 작성

**Files:**

- Modify: `src/features/partyroom/enter/lib/use-partyroom-enter-error-alerts.test.ts`

- [ ] **Step 1: Update i18n mock to include new key**

In the `beforeEach` block (line 16-19), extend the mocked i18n object to include the new key:

```ts
(useI18n as Mock).mockReturnValue({
  partyroom: {
    ec: {
      shut_down: 'Room closed',
      profile_required: 'Profile required',
    },
  },
  auth: { para: { auth_quota_exceeded: 'Limit exceeded' } },
});
```

- [ ] **Step 2: Update count assertion**

In the `'3개의 에러 코드에 대해 useOnError를 등록한다'` test (line 26-33):

- Rename the test title to `'4개의 에러 코드에 대해 useOnError를 등록한다'`
- Change `expect(useOnError).toHaveBeenCalledTimes(3)` to `4`
- Add `expect(useOnError).toHaveBeenCalledWith(ErrorCode.PROFILE_REQUIRED, expect.any(Function));` after the existing three `toHaveBeenCalledWith` lines

- [ ] **Step 3: Add new behavior test**

Append after the existing `EXCEEDED_LIMIT` test (line 44-51):

```ts
test('PROFILE_REQUIRED 콜백이 profile_required 메시지로 alert를 연다', () => {
  (useOnError as Mock).mockImplementation((code: ErrorCode, cb: (...args: any[]) => void) => {
    if (code === ErrorCode.PROFILE_REQUIRED) cb();
  });

  renderHook(() => usePartyroomEnterErrorAlerts());
  expect(mockOpenAlertDialog).toHaveBeenCalledWith({ content: 'Profile required' });
});
```

- [ ] **Step 4: Run the test and confirm it fails**

Run: `yarn test src/features/partyroom/enter/lib/use-partyroom-enter-error-alerts.test.ts`
Expected: 2 failures —

1. `'4개의 에러 코드에 대해 useOnError를 등록한다'` fails: `useOnError` called 3 times, expected 4
2. `'PROFILE_REQUIRED 콜백이 ...'` fails: `mockOpenAlertDialog` not called (no handler exists)

If either expected failure is missing, stop and inspect — the assertions may not be wired correctly.

---

### Task 4: 핸들러 구현

**Files:**

- Modify: `src/features/partyroom/enter/lib/use-partyroom-enter-error-alerts.ts:20-22`

- [ ] **Step 1: Add the PROFILE_REQUIRED handler**

After the existing `EXCEEDED_LIMIT` handler block (line 20-22), append:

```ts
useOnError(ErrorCode.PROFILE_REQUIRED, () => {
  openAlertDialog({ content: t.partyroom.ec.profile_required });
});
```

The full hook body now registers four handlers (NOT_FOUND_ROOM, ALREADY_TERMINATED, EXCEEDED_LIMIT, PROFILE_REQUIRED). Header JSDoc unchanged.

- [ ] **Step 2: Run the test and confirm both fixed**

Run: `yarn test src/features/partyroom/enter/lib/use-partyroom-enter-error-alerts.test.ts`
Expected: 4 tests, all PASS.

If still failing, the most likely causes:

- Typo in `ErrorCode.PROFILE_REQUIRED` reference (TS will surface this)
- The new mock i18n key path doesn't match the production reference path

---

### Task 5: Cross-cut verification

- [ ] **Step 1: Type check**

Run: `yarn test:type`
Expected: PASS

- [ ] **Step 2: Lint**

Run: `yarn lint`
Expected: PASS (no new warnings)

- [ ] **Step 3: Full test suite (related slice)**

Run: `yarn test src/features/partyroom`
Expected: all PASS, no regressions in adjacent partyroom features.

- [ ] **Step 4: Commit handler chunk**

```bash
git add src/features/partyroom/enter/lib/use-partyroom-enter-error-alerts.ts src/features/partyroom/enter/lib/use-partyroom-enter-error-alerts.test.ts
git commit -m "$(cat <<'EOF'
feat(partyroom): handle CRW-004 profile_required on enter

When backend rejects partyroom entry with CRW-004 (incomplete profile),
show a friendly alert dialog. Layout-level profileUpdated guard remains
the primary defense; this is a backstop for race / cache-stale cases.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Chunk 3: Spec drift sync (mid-PR scope expansion)

After chunks 1–2 completed, a full audit (openapi.json ↔ pfplay-web) surfaced additional drift unrelated to admin sync. The user approved bundling Critical drift (excluding the V13 report endpoint, which is intentionally deferred) and a fresh `PlaybackSummary.duration` field added in a same-day spec update into this PR. Spec doc updated accordingly via implicit consensus.

### Task 7: ErrorCode 정정/추가

**Files:**

- Modify: `src/shared/api/http/types/@shared.ts`

- [x] Fix typo: `NOT_FOUND_TRACK = 'TRL-003'` → `'TRK-003'` (BE never emitted TRL-003)
- [x] Re-map: `AVATAR_SELECTION_FORBIDDEN = 'AVT-001'` → `'UAV-001'`. AVT-001 is admin-side avatar resource naming conflict; service-side avatar selection forbidden uses UAV-001.
- [x] Add `INVALID_PARTYROOM_TRANSITION = 'PTR-007'` (허용되지 않은 파티룸 상태 전이)
- [x] Add OAuth error block:
  - `OAUTH_CHALLENGE_FAILED = 'AUTH-001'` (코드 챌린지 생성 실패)
  - `OAUTH_PROVIDER_NOT_CONFIGURED = 'AUTH-002'`
  - `INVALID_OAUTH_PROVIDER = 'AUTH-003'`
  - `INVALID_OAUTH_STATE = 'AUTH-004'` (state 만료/무효)

Verification: `yarn test:type` PASS.

### Task 8: PartyroomSummary.playback duration 필드 추가

**Files:**

- Modify: `src/shared/api/http/types/partyrooms.ts` (PartyroomSummary type)

- [x] Add `duration: string` to inline `playback?: { ... }` shape, mirroring BE `PlaybackSummary { name, thumbnailImage, duration }` from the latest spec update.

Verification: `yarn test:type` PASS.

### Task 9: profile summary endpoint users → crews 이전

**Files:**

- Modify: `src/shared/api/http/types/users.ts` (remove dead types + UsersClient entry)
- Modify: `src/shared/api/http/services/users.ts` (remove dead method + import)
- Modify: `src/shared/api/http/types/crews.ts` (add new types + CrewsClient entry)
- Modify: `src/shared/api/http/services/crews.ts` (add new method)

- [x] FE was calling `/v1/users/{uid}/profile/summary` which does not exist on BE. Real BE endpoint: `GET /v1/crews/{crewId}/profile/summary` (returns `CrewProfileSummaryResult`).
- [x] Method had no callers (TODO comments labeled it speculative). Move it to its semantically-correct location instead of fixing in-place.
- [x] New shape:
  ```ts
  type GetCrewProfileSummaryRequest = { crewId: number };
  type GetCrewProfileSummaryResponse = {
    crewId: number;
    nickname: string;
    introduction?: string;
    avatarBodyUri: string;
    avatarFaceUri: string;
    combinePositionX?: number;
    combinePositionY?: number;
    activitySummaries: ActivitySummary[];
  };
  ```
  `ActivitySummary` re-imported from `users.ts`.

Verification: `yarn test:type` PASS, `yarn lint` PASS, `yarn test` (209 files / 1065 tests) PASS.

### Task 10: Chunk 3 커밋

- [x] Commit: `chore(api): sync remaining drift with latest OpenAPI spec` — single atomic commit covering all six files.

---

## Out-of-scope reminders

These are intentionally NOT in the plan (already documented in spec):

- HIDDEN displayFlag handling (backend filters; user can't create HIDDEN rooms)
- DJ grade-change CRW-004 alert (covered by existing `informSocialType` pre-check)
- enter-time `isGuest` pre-check (would conflict with layout-level `profileUpdated` guard)
- OpenAPI codegen tooling (separate tech-debt PR)
- V13 partyroom report endpoint (`POST /partyrooms/{id}/reports`) — explicitly deferred by user during chunk-3 scope discussion
- Medium / Low audit findings (PNT-003/004, RCT-001, PUT notice, ImposePenaltyPayload.detailValid, ProviderType TWITTER/LOCAL, etc.) — separate follow-up sync PR

If any of these surface during execution, surface to human — do not silently expand scope.
