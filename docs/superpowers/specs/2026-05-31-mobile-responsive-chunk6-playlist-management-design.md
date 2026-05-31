# 모바일 반응형 — Chunk 6 (플레이리스트 관리 sheet) Design Spec

**Date:** 2026-05-31
**Chunk:** chunk 6 (chunk 5 catch-up 머지 직후)
**Status:** Draft v1 (brainstorming 잠금 → spec → reviewer → writing-plans)
**선행:** [`2026-05-22-mobile-responsive-scope-design.md`](./2026-05-22-mobile-responsive-scope-design.md) · [`2026-05-28-mobile-responsive-architecture-design.md`](./2026-05-28-mobile-responsive-architecture-design.md) · [`2026-05-29-mobile-responsive-chunk4-dj-queuing-design.md`](./2026-05-29-mobile-responsive-chunk4-dj-queuing-design.md) · [`2026-05-30-mobile-lobby-card-catchup-design.md`](./2026-05-30-mobile-lobby-card-catchup-design.md)

## 1. Goal

모바일 사용자가 **룸 내부에서 자기 플레이리스트를 직접 관리**(생성·곡 추가·곡 삭제·플리 삭제)할 수 있게 한다. 현재 모바일은 플리 관리 진입점이 데스크탑 전용 `/me/playlist` 페이지뿐이라, DJ 등록 흐름에서 "플리가 비었다" 상황에 부딪히면 데스크탑 UI 로 튕기는 회귀(chunk 4 §10)가 남아 있다. chunk 6 은 그 hole 을 룸 내부 sheet stack 으로 메운다.

**모바일 게이트 라인 관점** — DJ 가 되려면 곡이 든 플리가 필요하다. chunk 4 가 "직접 음악을 틀 수 있다"를 보여줬다면, chunk 6 은 그 직전 단계(플리·곡 준비)를 모바일 자족적으로 완성해 DJ 전환 깔때기의 마지막 막힘을 제거한다.

## 2. 배경: chunk 시리즈에서의 위치

- chunk 4 (`2026-05-29-...chunk4-dj-queuing-design.md`): DJ 등록 + 큐잉 + add-tracks 검색. `useMobileSelectPlaylist` 가 빈 플리 시 `/me/playlist` push (§10) — **chunk 6 에서 보정 대상**.
- chunk 5 catch-up: `/mobile-notice` 제거 + lobby 카드 v1 + 회귀 sweep. `AddTracksSheet`(`widgets-mobile/partyroom-djing-sheet/ui/add-tracks-sheet.component.tsx`) 가 여기서 완성됨 — **chunk 6 이 변경 0 으로 재사용**.
- chunk 6 (본 spec): 플리 관리 sheet stack. queue 탭 `MemberActions` 에 진입점 추가.

## 3. 결정 잠금 (brainstorming 산출물, 2026-05-31)

| #   | 결정              | 값                                                                                                                                          |
| --- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 접근 범위         | **룸 내부 전용**. 로비/헤더 진입점 없음. 데스크탑은 로비·룸 양쪽 가능하나 모바일은 의도적 제약                                              |
| 2   | 진입점            | **queue 탭 `MemberActions` 안 secondary 액션** ("내 플레이리스트 관리"). 게스트는 `GuestCta` 분기로 자동 차단 (chunk 4 패턴)                |
| 3   | 기능 범위 = MVP   | 플리 생성 / 곡 추가(AddTracksSheet 재사용) / 곡 삭제 / 플리 삭제                                                                            |
| 4   | Out of scope      | 곡 순서 변경, 플리 이름 편집, 곡 다른 플리로 이동, `/me/playlist` 페이지 자체 모바일 분기                                                   |
| 5   | Grab 플리 가드    | **GRABLIST 삭제 불가** (데스크탑 `editable-list.component.tsx:81 isGrabPlaylist` 동등). 곡 삭제·곡 추가도 데스크탑과 동일하게 처리(아래 §7) |
| 6   | 데이터 hook       | 모바일 전용 hook 신규 없음. 데스크탑 feature hook 직접 import 재사용                                                                        |
| 7   | chunk 4 회귀 보정 | `useMobileSelectPlaylist` 의 `/me/playlist` push 경로를 PlaylistsManagementSheet stack push 로 교체                                         |

## 4. Sheet stack 구조 (4-level)

```
Level 0: room queue 탭 (MobilePartyroomQueuePanel)
  └ MemberActions: "내 플레이리스트 관리" 클릭 → push(L1)
Level 1: PlaylistsManagementSheet (플리 목록)
  - body: 플리 카드 (이름 · "{n}곡" · [삭제] · 카드 클릭 → push L2)
  - footer: [+ 새 플레이리스트] → 인라인 입력 form (sheet 내부 토글, 별도 level 아님)
  - empty: "아직 플레이리스트가 없어요" + 동일 CTA
Level 2: PlaylistDetailSheet (선택 플리의 곡 목록)
  - body: 곡 카드 (썸네일 · 제목 · [×])
  - footer: [+ 곡 추가] → push L3
  - empty: "아직 곡이 없어요" + 동일 CTA
Level 3: AddTracksSheet (chunk 5 재사용, 변경 0)
  - playlistId prop 만 PlaylistDetailSheet 에서 전달
```

기존 chunk 4·5 `FullscreenSheetProvider` + `SheetHost` 그대로 사용. queue 탭에 이미 마운트됨 (`widgets-mobile/partyroom-queue-panel/ui/queue-panel.component.tsx:70-75`). push/pop/dedup/popstate/ESC 시맨틱은 `use-fullscreen-sheet.hook.tsx` 가 이미 보유 — 본 chunk 은 신규 sheet entry 만 push.

### 4.1 push/pop 계약 (기존 hook 재확인)

- `push({ key, node, title?, onClose? })` — top 과 같은 `key` 면 dedup(무시). `history.pushState` 발생.
- `pop()` — top.onClose?.() 후 1개 제거. popstate/ESC 와 동일 경로.
- key 네임스페이스: `playlists-management` / `playlist-detail` / `add-tracks`(기존). 같은 level 재진입 dedup 을 위해 detail 은 `playlist-detail-${listId}` 로 구분(서로 다른 플리는 다른 key → push 가능).

## 5. 디렉터리 구조 (신규/수정)

```
src/
├── widgets-mobile/partyroom-queue-panel/ui/
│   └── member-actions.component.tsx            (수정) — "내 플레이리스트 관리" secondary 액션 추가
│
├── widgets-mobile/partyroom-djing-sheet/ui/    (기존 sheet 패밀리에 합류)
│   ├── playlists-management-sheet.component.tsx   ⭐ 신규 (L1 목록 + 생성 form)
│   ├── playlist-detail-sheet.component.tsx        ⭐ 신규 (L2 곡 목록 + 삭제)
│   └── add-tracks-sheet.component.tsx          (변경 0, L3 재사용)
│
├── features-mobile/playlist/manage/            ⭐ 신규 (모바일 진입 hook — 격리 사본)
│   └── ui/use-open-playlists-management.hook.tsx  — push(L1) 캡슐화 (MemberActions·select-playlist hook 둘 다 호출)
│
└── features-mobile/partyroom/select-playlist-for-djing/ui/
    └── use-mobile-select-playlist.hook.tsx     (수정) — 빈 플리 분기를 L1 push 로 교체 (§7.3)
```

설계 노트: L1/L2 sheet 컴포넌트는 데스크탑과 어휘가 다른 모바일 표면이라 `widgets-mobile/partyroom-djing-sheet` 에 둔다(chunk 4 add-tracks/select-playlist 와 같은 위치). 진입 hook 은 `features-mobile/playlist/manage` 로 분리해 MemberActions(룸 큐 탭)와 `use-mobile-select-playlist`(DJ 등록 흐름) 두 호출처가 동일 push 로직을 공유한다(중복 회피 — [[feedback_elegant_no_code_dirtying]]).

## 6. 데이터 hook 재사용 (데스크탑 직접 import)

| 동작      | hook                                                                | 시그니처                                                                               |
| --------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 목록 조회 | `useFetchPlaylists` (`features/playlist/list`)                      | `({enabled?}) => Playlist[]`. GRABLIST 이름 i18n 덮어쓰기 내장                         |
| 생성      | `useCreatePlaylist` (`features/playlist/add/api/...`)               | `mutate({ name })`. 성공 시 `[Playlist]` invalidate                                    |
| 플리 삭제 | `useRemovePlaylist` (`features/playlist/remove/api/...`)            | `mutate(number[])`. `[Playlist]` invalidate                                            |
| 곡 목록   | `useFetchPlaylistTracks` (`features/playlist/list-tracks/api/...`)  | `(listId) => PaginationResponse<PlaylistTrack>` (`.content`)                           |
| 곡 삭제   | `useRemovePlaylistTrack` (`features/playlist/remove-track/api/...`) | `mutate({ playlistId, trackId })`. `[PlaylistTracks,listId]` + `[Playlist]` invalidate |
| 곡 추가   | `useAddPlaylistTrack` (AddTracksSheet 내부)                         | 변경 0                                                                                 |

신규 mutation/query 없음. `Playlist`/`PlaylistTrack` 타입은 `shared/api/http/types/playlists.ts` 그대로.

## 7. 컴포넌트별 동작 명세

### 7.1 PlaylistsManagementSheet (L1)

- 데이터: `useFetchPlaylists({ enabled: true })` (룸 멤버만 도달하므로 항상 enabled). `useCreatePlaylist`, `useRemovePlaylist`.
- 카드: `p.name` · `{p.musicCount}곡`. 카드 클릭 → `onOpenDetail(p)` (부모 hook 이 L2 push).
- 삭제 버튼: `isGrabPlaylist(p)`(type===GRABLIST) → 삭제 버튼 미렌더(또는 disabled). 데스크탑 `editable-list.component.tsx:81` 와 동일 가드. 삭제는 confirm dialog(`useDialog`, 기존 키 `t.playlist.para.delete_playlist_confirm` 재사용 — 데스크탑 `remove-button.component.tsx:23` 와 동일) → `useRemovePlaylist.mutate([p.id])`.
- 생성 form: footer `[+ 새 플레이리스트]` 토글 → 인라인 text input + [추가]/[취소]. submit → `useCreatePlaylist.mutate({ name })` → 성공 시 input 초기화 + form 닫기(목록은 invalidate 로 자동 refetch).
- empty: `playlists.length === 0`(실제로는 GRABLIST 가 항상 있어 0 거의 없음 — 방어적으로 처리) → 안내 문구 + 동일 생성 CTA.
- 곡 0개 플리도 카드 자체는 정상 표시(빈 곡은 L2 에서 처리). 데스크탑 select 흐름의 `disabled` 와 달리 **관리 모드에서는 빈 플리도 열 수 있어야** 곡을 추가할 수 있다(이게 chunk 6 의 핵심 차이).

### 7.2 PlaylistDetailSheet (L2)

- props: `{ playlist: Playlist }` (또는 `listId` + name). 데이터: `useFetchPlaylistTracks(listId)`(`.content`), `useRemovePlaylistTrack`.
- 곡 카드: `track.thumbnailImage` · `track.name`(+`track.duration`) · `[×]`. `[×]` → `useRemovePlaylistTrack.mutate({ playlistId: listId, trackId: track.trackId })`. **confirm 없이 즉시** — 데스크탑 `tracks.component.tsx:108 playlistAction.removeTrack` 가 confirm 없이 직접 호출하는 것과 동일(baseline 확정).
- footer: `[+ 곡 추가]` → `push(AddTracksSheet, { playlistId: listId })` (L3, 기존 key `add-tracks`).
- empty: `tracks.length === 0` → "아직 곡이 없어요" + 동일 `[+ 곡 추가]` CTA.
- **Grab 플리 곡 삭제 = 허용**(baseline 확정). 데스크탑 `TracksInPlaylist` 는 플리 타입과 무관하게 모든 곡에 삭제 메뉴를 렌더(Grab 가드는 플리 _레벨_ 삭제에만 존재). 모바일도 동일.

### 7.3 useMobileSelectPlaylist 회귀 보정 (chunk 4 §10)

현재 (`use-mobile-select-playlist.hook.tsx:36-42`):

```
if (playlists.length === 0) {
  const confirmed = await openConfirmDialog({ content: t.dj.para.create_playlist_song });
  if (confirmed) router.push('/me/playlist');   // ← 데스크탑 UI 로 튕김 = 회귀
  return undefined;
}
```

변경 후: confirm + router.push 제거. 그 자리에서 `openPlaylistsManagement()`(§5 신규 hook) 로 L1 push (SelectPlaylistSheet 와 동일 stack). 사용자가 sheet 안에서 플리 생성 + 곡 추가 → close 시 SelectPlaylistSheet 흐름으로 자연 복귀(목록 invalidate refetch). `router`·`openConfirmDialog`·`t.dj.para.create_playlist_song` 의존 제거.

설계 주의: §brainstorm 의 stack 순서 — L1 을 SelectPlaylistSheet **위에** push 할지, SelectPlaylist 진입 전에 push 할지. `playlists.length===0` 이면 SelectPlaylistSheet 는 아직 안 떴으므로 L1 만 push(단독). 사용자가 플리·곡 준비 후 close → hook 의 Promise 는 `resolve(undefined)`(곡 선택 미완) → 호출처(DJ 등록)가 재시도하면 이제 playlists 가 채워져 정상 SelectPlaylistSheet 진입. **Promise resolve 타이밍은 chunk 4 의 [[reference_setstate_updater_sync_callback_race]] 규약 유지** — onClose=resolve(undefined).

## 8. 게스트 제약 (chunk 4 패턴 그대로)

`queue-panel.component.tsx:43-54` 의 `isGuest`(AuthorityTier.GT) 분기 → 게스트는 `GuestCta` 만 보고 `MemberActions` 자체가 렌더 안 됨 → "내 플레이리스트 관리" 진입점 자동 차단. 별도 처리·테스트 불필요(기존 분기가 커버). 단, MemberActions 단위 테스트에 secondary 액션 렌더 케이스 추가.

## 9. i18n 키 (신규)

기존 `t.partyroom.queue.*` 네임스페이스에 추가. ko/en 직접 수정([[feedback_pfplay_web_i18n_drift]] — `yarn i18n` 무지성 실행 금지, ko/en json + xlsx 동기 수동).

| 키                                 | ko                         | en (잠정)           |
| ---------------------------------- | -------------------------- | ------------------- |
| `member_action_manage_playlists`   | 내 플레이리스트 관리       | Manage my playlists |
| `sheet_playlists_management_title` | 내 플레이리스트            | My playlists        |
| `sheet_playlist_detail_title`      | (플리 이름 동적)           | (dynamic)           |
| `playlists_empty`                  | 아직 플레이리스트가 없어요 | No playlists yet    |
| `playlist_tracks_empty`            | 아직 곡이 없어요           | No songs yet        |
| `create_playlist_cta`              | + 새 플레이리스트          | + New playlist      |
| `create_playlist_placeholder`      | 플레이리스트 이름          | Playlist name       |

플리 삭제 confirm 은 **기존 키 `t.playlist.para.delete_playlist_confirm` 재사용**(신규 키 X). 곡 삭제는 confirm 없음 → 키 불필요. (나머지 신규 키 네이밍·문구는 reviewer + 기존 키 컨벤션 grep 후 확정.)

## 10. 테스트 계획 (TDD — writing-plans 에서 case 분해)

- **PlaylistsManagementSheet**: 목록 렌더 / GRABLIST 삭제버튼 미노출 / 일반 플리 삭제 confirm→mutate / 생성 form submit→mutate / empty 상태 / 카드 클릭→onOpenDetail.
- **PlaylistDetailSheet**: 곡 목록 렌더 / 곡 [×]→remove mutate / empty→CTA / [+곡추가]→push add-tracks.
- **useMobileSelectPlaylist (회귀)**: 빈 플리 → router.push **호출 안 함** + L1 push 호출 / 정상 플리 → 기존 SelectPlaylistSheet 흐름 유지(회귀 0).
- **MemberActions**: secondary 액션 렌더 + onClick 콜백.
- **use-open-playlists-management hook**: push(L1) entry key/node/onClose 계약.
- 회귀: queue-panel 게스트 분기(MemberActions 미렌더) 기존 테스트 유지.

## 11. 검증

- 단위/통합: `npx vitest run` (또는 프로젝트 스크립트) GREEN, typecheck 0, lint clean.
- 로컬 E2E/headed: 룸 진입 → queue 탭 → 관리 sheet 4-level 왕복([[reference_pfplay_web_local_dev_http_webpack]] — `npx next dev`, yarn dev 금지). 빈 플리 회귀 경로(DJ 등록 → 관리 sheet) 수동 확인.
- E2E spec 신규 추가 여부는 chunk 4/5 E2E 부담([[reference_e2e_preview_alias_race]]) 고려해 writing-plans 에서 결정(단위·통합 우선, E2E 는 happy-path 1개 정도).

## 12. PR

- base `development`. 한글 커밋/PR([[feedback_korean_issue_commit_pr]]). push 전 논리 단위 squash([[feedback_commit_consolidation_before_push]]).
- GitHub 이슈 먼저 등록 후 진행([[feedback_korean_issue_commit_pr]]).
- release/main ship = 사용자 게이트.

## 13. 미해결 (reviewer 라운드에서 확정)

1. ✅ ~~곡 삭제 confirm 유무~~ — 데스크탑 baseline 확정: **confirm 없이 즉시**(§7.2).
2. ✅ ~~Grab 플리의 곡 삭제 허용 여부~~ — 데스크탑 baseline 확정: **허용**(§7.2).
3. L1/L2 sheet 컴포넌트 위치(`widgets-mobile/partyroom-djing-sheet` vs 신규 `partyroom-playlist-sheet`) — 패밀리 비대 시 분리 검토.
4. i18n 키 최종 네이밍 — 기존 컨벤션 grep(reviewer).
