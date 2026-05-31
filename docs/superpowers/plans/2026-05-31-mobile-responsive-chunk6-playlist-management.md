# 모바일 Chunk 6 (플레이리스트 관리 sheet) Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 모바일 룸 내부 queue 탭에서 자기 플레이리스트를 직접 생성·곡추가·곡삭제·플리삭제할 수 있는 4-level 풀스크린 sheet stack 을 추가한다.

**Architecture:** 기존 `FullscreenSheetProvider`/`SheetHost`(chunk 4/5) 위에 신규 sheet entry 2개(L1 목록, L2 상세)를 push 한다. 데스크탑 데이터 hook(`useFetchPlaylists`/`useCreatePlaylist`/`useRemovePlaylist`/`useFetchPlaylistTracks`/`useRemovePlaylistTrack`)을 직접 재사용하고, L3 는 chunk 5 `AddTracksSheet`(변경 0)를 그대로 push 한다. 진입점은 (a) queue 탭 `MemberActions` secondary 액션, (b) DJ 등록 흐름의 빈-플리 회귀 보정 두 곳이며, 공통 push 로직을 `useOpenPlaylistsManagement` hook 하나로 캡슐화한다.

**Tech Stack:** Next.js (App Router) · React · TypeScript · @tanstack/react-query · vitest + @testing-library/react · tailwind

**Spec:** [`docs/superpowers/specs/2026-05-31-mobile-responsive-chunk6-playlist-management-design.md`](../specs/2026-05-31-mobile-responsive-chunk6-playlist-management-design.md)

---

## File Structure

| 파일                                                                                             | 책임                                                     | 신규/수정 |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------- | --------- |
| `src/shared/lib/localization/dictionaries/ko.json` · `en.json`                                   | 신규 i18n 키(`partyroom.queue.*`)                        | 수정      |
| `src/features-mobile/playlist/manage/ui/use-open-playlists-management.hook.tsx`                  | L1 push 캡슐화. 두 진입점 공유                           | 신규      |
| `src/features-mobile/playlist/manage/index.ts`                                                   | public export                                            | 신규      |
| `src/widgets-mobile/partyroom-djing-sheet/ui/playlists-management-sheet.component.tsx`           | L1 — 플리 목록 + 생성 form + 삭제 + 카드→L2 push         | 신규      |
| `src/widgets-mobile/partyroom-djing-sheet/ui/playlist-detail-sheet.component.tsx`                | L2 — 곡 목록 + 곡 삭제 + [+곡추가]→L3 push               | 신규      |
| `src/widgets-mobile/partyroom-queue-panel/ui/member-actions.component.tsx`                       | secondary "내 플레이리스트 관리" 액션 추가               | 수정      |
| `src/widgets-mobile/partyroom-queue-panel/ui/queue-panel.component.tsx`                          | `useOpenPlaylistsManagement` wiring → MemberActions prop | 수정      |
| `src/features-mobile/partyroom/select-playlist-for-djing/ui/use-mobile-select-playlist.hook.tsx` | 빈-플리 분기 `/me/playlist` push → L1 push 교체          | 수정      |

**의존 규칙:** L1/L2 sheet 컴포넌트는 `widgets-mobile/partyroom-djing-sheet`(chunk 4/5 `AddTracksSheet`·`SelectPlaylistSheet` 와 동일 패밀리). 공통 진입 hook 은 `features-mobile/playlist/manage`(두 호출처 — queue-panel·select-playlist hook — 가 공유). 데이터 hook 은 데스크탑 `features/playlist/*` 직접 import.

**테스트 하네스 규약(기존 chunk 4/5 패턴, 반드시 동일하게):**

- i18n: `vi.mock('@/shared/lib/localization/i18n.context', () => ({ useI18n: () => ({...}) }))` — 필요한 키만 pass-through.
- 데이터 hook: 모듈 경로별 `vi.mock` 으로 `{ data }` / `{ mutate, isPending }` 반환.
- `useDialog`: `vi.mock('@/shared/ui/components/dialog', ...)` 로 `openDialog`/`openConfirmDialog` spy.
- `useFullscreenSheet`: 컴포넌트는 `FullscreenSheetProvider` wrapper 로 감싸 실제 push/pop 검증, 또는 `vi.mock` 으로 push spy.
- testid 네이밍: 기존 컨벤션 따름(`mobile-playlist-card-${id}`, `member-action-*` 등).

---

## Chunk 1: 플레이리스트 관리 sheet stack

### Task 0: 사전 준비 — 브랜치·이슈·baseline 확인

- [ ] **Step 1: 브랜치 확인**

Run: `git -C "<repo>" branch --show-current`
Expected: `feature/mobile-responsive-chunk6` (origin/development `9bacc6b` base, 0 commit)

- [ ] **Step 2: 기존 테스트 GREEN baseline 확보**

Run: `npx vitest run src/widgets-mobile/partyroom-queue-panel src/widgets-mobile/partyroom-djing-sheet src/features-mobile/partyroom/select-playlist-for-djing`
Expected: 전부 PASS (회귀 비교 기준선)

- [ ] **Step 3: GitHub 이슈 등록** (한글, [[feedback_korean_issue_commit_pr]])

제목 예: `[모바일] 룸 내부 플레이리스트 관리 sheet (chunk 6)`. 본문에 spec 링크 + 4-level stack 요약. 이슈 번호 기록.

---

### Task 1: i18n 키 추가 (ko/en)

> ⚠️ [[feedback_pfplay_web_i18n_drift]] — `yarn i18n` 무지성 실행 금지. ko/en json 직접 수정. xlsx 동기화는 별도(이번 작업 범위는 json 만).

**Files:**

- Modify: `src/shared/lib/localization/dictionaries/ko.json` (`partyroom.queue` 객체)
- Modify: `src/shared/lib/localization/dictionaries/en.json` (`partyroom.queue` 객체)

- [ ] **Step 1: 기존 키 컨벤션 확인**

Run: `npx grep -n "member_action_register\|sheet_select_playlist_title" src/shared/lib/localization/dictionaries/ko.json`
(또는 Read 로 `partyroom.queue` 블록 확인 — snake_case 컨벤션)

- [ ] **Step 2: ko.json `partyroom.queue` 에 키 추가**

```json
"member_action_manage_playlists": "내 플레이리스트 관리",
"sheet_playlists_management_title": "내 플레이리스트",
"playlists_empty": "아직 플레이리스트가 없어요",
"playlist_tracks_empty": "아직 곡이 없어요",
"create_playlist_cta": "+ 새 플레이리스트",
"create_playlist_placeholder": "플레이리스트 이름",
"create_playlist_submit": "추가",
"remove_track_label": "삭제",
"add_tracks_cta": "+ 곡 추가"
```

(플리 삭제 confirm 은 기존 `t.playlist.para.delete_playlist_confirm` 재사용 — 신규 키 X. 곡 삭제는 confirm 없음.)

- [ ] **Step 3: en.json 동일 키 추가**

```json
"member_action_manage_playlists": "Manage my playlists",
"sheet_playlists_management_title": "My playlists",
"playlists_empty": "No playlists yet",
"playlist_tracks_empty": "No songs yet",
"create_playlist_cta": "+ New playlist",
"create_playlist_placeholder": "Playlist name",
"create_playlist_submit": "Add",
"remove_track_label": "Remove",
"add_tracks_cta": "+ Add songs"
```

- [ ] **Step 4: typecheck (Dictionary 타입 동기 확인)**

Run: `npx tsc --noEmit`
Expected: ko/en 키 비대칭 시 타입 에러. 0 에러여야 통과.

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/localization/dictionaries/ko.json src/shared/lib/localization/dictionaries/en.json
git commit -m "feat(i18n): chunk6 플레이리스트 관리 sheet 키 추가"
```

---

### Task 2: `useOpenPlaylistsManagement` hook (L1 push 캡슐화)

**Files:**

- Create: `src/features-mobile/playlist/manage/ui/use-open-playlists-management.hook.tsx`
- Create: `src/features-mobile/playlist/manage/index.ts`
- Test: `src/features-mobile/playlist/manage/ui/use-open-playlists-management.hook.test.tsx`

설계: `() => void` 반환. 호출 시 L1 sheet 를 push. key `playlists-management`. node 는 `PlaylistsManagementSheet`(Task 3 에서 생성 — 이 Task 에서는 import 만, 컴파일 위해 Task 3 의 stub 가 먼저 있어야 하므로 **Task 3 의 컴포넌트 stub 을 먼저 만든 뒤 본 Task 진행**하거나, 본 Task 에서 임시 placeholder node 로 테스트 후 Task 3 에서 교체).

> 실행 순서 주의: Task 3(L1 컴포넌트)와 Task 2(hook)는 상호 참조. **권장: Task 3 의 Step 1~4(컴포넌트 최소 구현)를 먼저 끝낸 뒤 Task 2 진행.** 아래 hook 테스트는 `PlaylistsManagementSheet` 를 `vi.mock` 으로 stub 하므로 독립 검증 가능.

- [ ] **Step 1: 실패 테스트 작성**

```tsx
// use-open-playlists-management.hook.test.tsx
import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import useOpenPlaylistsManagement from './use-open-playlists-management.hook';

const pushMock = vi.fn();
vi.mock('@/widgets-mobile/partyroom-djing-sheet', () => ({
  useFullscreenSheet: () => ({ push: pushMock, pop: vi.fn() }),
}));
vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    partyroom: { queue: { sheet_playlists_management_title: '내 플레이리스트' } },
  }),
}));
vi.mock('@/widgets-mobile/partyroom-djing-sheet/ui/playlists-management-sheet.component', () => ({
  default: () => null,
}));

describe('useOpenPlaylistsManagement', () => {
  test('호출 시 key=playlists-management sheet 를 push', () => {
    const { result } = renderHook(() => useOpenPlaylistsManagement());
    result.current();
    expect(pushMock).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'playlists-management', title: '내 플레이리스트' })
    );
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/features-mobile/playlist/manage/ui/use-open-playlists-management.hook.test.tsx`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: 최소 구현**

```tsx
// use-open-playlists-management.hook.tsx
'use client';
import { useCallback } from 'react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useFullscreenSheet } from '@/widgets-mobile/partyroom-djing-sheet';
import PlaylistsManagementSheet from '@/widgets-mobile/partyroom-djing-sheet/ui/playlists-management-sheet.component';

/**
 * 모바일 "내 플레이리스트 관리" 진입 hook (spec §5).
 * queue 탭 MemberActions 와 DJ 등록 빈-플리 회귀 보정 두 곳이 공유.
 * L1(PlaylistsManagementSheet) 를 fullscreen sheet stack 에 push 한다.
 */
export default function useOpenPlaylistsManagement(): () => void {
  const t = useI18n();
  const { push } = useFullscreenSheet();

  return useCallback(() => {
    push({
      key: 'playlists-management',
      title: t.partyroom.queue.sheet_playlists_management_title,
      node: <PlaylistsManagementSheet />,
    });
  }, [push, t.partyroom.queue.sheet_playlists_management_title]);
}
```

```ts
// index.ts
export { default as useOpenPlaylistsManagement } from './ui/use-open-playlists-management.hook';
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/features-mobile/playlist/manage/ui/use-open-playlists-management.hook.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features-mobile/playlist/manage
git commit -m "feat(mobile): 플레이리스트 관리 진입 hook (L1 push)"
```

---

### Task 3: `PlaylistsManagementSheet` (L1 — 목록 + 생성 + 삭제 + 카드→L2)

**Files:**

- Create: `src/widgets-mobile/partyroom-djing-sheet/ui/playlists-management-sheet.component.tsx`
- Test: `src/widgets-mobile/partyroom-djing-sheet/ui/playlists-management-sheet.component.test.tsx`

동작(spec §7.1):

- `useFetchPlaylists({ enabled: true })` → `Playlist[]`(직접 배열, `{playlists}` 아님).
- 카드: 이름 + `{musicCount}곡`. 클릭 → `push({ key: \`playlist-detail-${p.id}\`, title: p.name, node: <PlaylistDetailSheet playlist={p} /> })`.
- 삭제: `p.type === PlaylistType.GRABLIST` 면 삭제 버튼 미렌더. 일반 플리는 confirm dialog(`useDialog().openDialog`, 기존 `t.playlist.para.delete_playlist_confirm`) → `removePlaylist.mutate([p.id])`.
- 생성 form: footer `[+ 새 플레이리스트]` 토글 → text input + [추가]. submit → `createPlaylist.mutate({ name }, { onSuccess: reset+close })`. 빈 문자열 submit 막기.
- empty(`playlists.length === 0`): 안내 + 동일 생성 CTA.

> 삭제 confirm 은 데스크탑 `remove-button.component.tsx:22` 의 `openDialog((_, onCancel) => ({ title, Body: <Dialog.ButtonGroup>... }))` 패턴 또는 `openConfirmDialog({ content })` 단순 패턴 중 **`openConfirmDialog` 단순 패턴 채택**(모바일 select hook 이 이미 `openConfirmDialog` 사용 — 일관성). `useDialog` 의 `openConfirmDialog` 시그니처는 `use-mobile-select-playlist.hook.tsx:32,37` 참조.

- [ ] **Step 1: 실패 테스트 작성**

```tsx
// playlists-management-sheet.component.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { PlaylistType } from '@/shared/api/http/types/@enums';
import PlaylistsManagementSheet from './playlists-management-sheet.component';

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    partyroom: {
      queue: {
        playlists_empty: '아직 플레이리스트가 없어요',
        create_playlist_cta: '+ 새 플레이리스트',
        create_playlist_placeholder: '플레이리스트 이름',
        create_playlist_submit: '추가',
      },
    },
    playlist: { para: { delete_playlist_confirm: '이 플레이리스트를 삭제할까요?' } },
    common: { btn: { cancel: '취소' } },
  }),
}));

const useFetchPlaylistsMock = vi.fn();
vi.mock('@/features/playlist/list', () => ({
  useFetchPlaylists: () => useFetchPlaylistsMock(),
}));
const createMutateMock = vi.fn();
vi.mock('@/features/playlist/add/api/use-create-playlist.mutation', () => ({
  useCreatePlaylist: () => ({ mutate: createMutateMock, isPending: false }),
}));
const removeMutateMock = vi.fn();
vi.mock('@/features/playlist/remove/api/use-remove-playlist.mutation', () => ({
  useRemovePlaylist: () => ({ mutate: removeMutateMock, isPending: false }),
}));
const pushMock = vi.fn();
const confirmMock = vi.fn();
vi.mock('@/widgets-mobile/partyroom-djing-sheet', () => ({
  useFullscreenSheet: () => ({ push: pushMock, pop: vi.fn() }),
}));
vi.mock('@/shared/ui/components/dialog', () => ({
  useDialog: () => ({ openConfirmDialog: (...a: unknown[]) => confirmMock(...a) }),
}));

const NORMAL = { id: 1, name: 'A', musicCount: 5, type: PlaylistType.PLAYLIST, orderNumber: 1 };
const GRAB = { id: 2, name: 'Grab', musicCount: 3, type: PlaylistType.GRABLIST, orderNumber: 0 };

describe('PlaylistsManagementSheet', () => {
  beforeEach(() => {
    createMutateMock.mockReset();
    removeMutateMock.mockReset();
    pushMock.mockReset();
    confirmMock.mockReset();
  });

  test('플리 목록 렌더 (이름 + 곡 수)', () => {
    useFetchPlaylistsMock.mockReturnValue({ data: [NORMAL, GRAB] });
    render(<PlaylistsManagementSheet />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('Grab')).toBeInTheDocument();
  });

  test('GRABLIST 카드 → 삭제 버튼 미렌더', () => {
    useFetchPlaylistsMock.mockReturnValue({ data: [NORMAL, GRAB] });
    render(<PlaylistsManagementSheet />);
    expect(screen.getByTestId('manage-playlist-delete-1')).toBeInTheDocument();
    expect(screen.queryByTestId('manage-playlist-delete-2')).not.toBeInTheDocument();
  });

  test('일반 플리 삭제 → confirm → removePlaylist.mutate([id])', async () => {
    confirmMock.mockResolvedValue(true);
    useFetchPlaylistsMock.mockReturnValue({ data: [NORMAL] });
    render(<PlaylistsManagementSheet />);
    await userEvent.click(screen.getByTestId('manage-playlist-delete-1'));
    await waitFor(() => expect(confirmMock).toHaveBeenCalled());
    expect(removeMutateMock).toHaveBeenCalledWith([1]);
  });

  test('삭제 confirm 취소 시 mutate 안 함', async () => {
    confirmMock.mockResolvedValue(false);
    useFetchPlaylistsMock.mockReturnValue({ data: [NORMAL] });
    render(<PlaylistsManagementSheet />);
    await userEvent.click(screen.getByTestId('manage-playlist-delete-1'));
    await waitFor(() => expect(confirmMock).toHaveBeenCalled());
    expect(removeMutateMock).not.toHaveBeenCalled();
  });

  test('생성 form: CTA → input → 제출 시 createPlaylist.mutate({name})', async () => {
    useFetchPlaylistsMock.mockReturnValue({ data: [NORMAL] });
    render(<PlaylistsManagementSheet />);
    await userEvent.click(screen.getByTestId('manage-create-cta'));
    await userEvent.type(screen.getByTestId('manage-create-input'), '새 플리');
    await userEvent.click(screen.getByTestId('manage-create-submit'));
    expect(createMutateMock).toHaveBeenCalledWith(
      { name: '새 플리' },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  test('빈 이름 제출 막기 (mutate 안 함)', async () => {
    useFetchPlaylistsMock.mockReturnValue({ data: [NORMAL] });
    render(<PlaylistsManagementSheet />);
    await userEvent.click(screen.getByTestId('manage-create-cta'));
    await userEvent.click(screen.getByTestId('manage-create-submit'));
    expect(createMutateMock).not.toHaveBeenCalled();
  });

  test('카드 클릭 → playlist-detail-${id} sheet push', async () => {
    useFetchPlaylistsMock.mockReturnValue({ data: [NORMAL] });
    render(<PlaylistsManagementSheet />);
    await userEvent.click(screen.getByTestId('manage-playlist-card-1'));
    expect(pushMock).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'playlist-detail-1', title: 'A' })
    );
  });

  test('empty 상태 → 안내 + 생성 CTA', () => {
    useFetchPlaylistsMock.mockReturnValue({ data: [] });
    render(<PlaylistsManagementSheet />);
    expect(screen.getByText('아직 플레이리스트가 없어요')).toBeInTheDocument();
    expect(screen.getByTestId('manage-create-cta')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/widgets-mobile/partyroom-djing-sheet/ui/playlists-management-sheet.component.test.tsx`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: 최소 구현**

```tsx
// playlists-management-sheet.component.tsx
'use client';
import { FC, useState } from 'react';
import { useCreatePlaylist } from '@/features/playlist/add/api/use-create-playlist.mutation';
import { useFetchPlaylists } from '@/features/playlist/list';
import { useRemovePlaylist } from '@/features/playlist/remove/api/use-remove-playlist.mutation';
import { PlaylistType } from '@/shared/api/http/types/@enums';
import { Playlist } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { useDialog } from '@/shared/ui/components/dialog';
import { TextButton } from '@/shared/ui/components/text-button';
import { Typography } from '@/shared/ui/components/typography';
import { useFullscreenSheet } from '@/widgets-mobile/partyroom-djing-sheet';
import PlaylistDetailSheet from './playlist-detail-sheet.component';

const PlaylistsManagementSheet: FC = () => {
  const t = useI18n();
  const { push } = useFullscreenSheet();
  const { openConfirmDialog } = useDialog();
  const { data: playlists = [] } = useFetchPlaylists({ enabled: true });
  const { mutate: createPlaylist } = useCreatePlaylist();
  const { mutate: removePlaylist } = useRemovePlaylist();

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');

  const openDetail = (p: Playlist) =>
    push({
      key: `playlist-detail-${p.id}`,
      title: p.name,
      node: <PlaylistDetailSheet playlist={p} />,
    });

  const handleDelete = async (p: Playlist) => {
    const confirmed = await openConfirmDialog({ content: t.playlist.para.delete_playlist_confirm });
    if (confirmed) removePlaylist([p.id]);
  };

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    createPlaylist(
      { name: trimmed },
      {
        onSuccess: () => {
          setName('');
          setIsCreating(false);
        },
      }
    );
  };

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 overflow-y-auto'>
        {playlists.length === 0 ? (
          <div className='flex h-full items-center justify-center px-4'>
            <Typography type='body3' className='text-gray-400'>
              {t.partyroom.queue.playlists_empty}
            </Typography>
          </div>
        ) : (
          <ul className='flex flex-col divide-y divide-gray-800'>
            {playlists.map((p) => {
              const isGrab = p.type === PlaylistType.GRABLIST;
              return (
                <li key={p.id} className='flex items-center justify-between gap-3 px-4 py-4'>
                  <button
                    type='button'
                    data-testid={`manage-playlist-card-${p.id}`}
                    onClick={() => openDetail(p)}
                    className='flex-1 text-left min-w-0'
                  >
                    <Typography type='body3' className='truncate'>
                      {p.name}
                    </Typography>
                    <Typography type='detail2' className='text-gray-400'>
                      {p.musicCount}곡
                    </Typography>
                  </button>
                  {!isGrab && (
                    <TextButton
                      data-testid={`manage-playlist-delete-${p.id}`}
                      onClick={() => handleDelete(p)}
                      className='text-red-300 px-2 py-1'
                      typographyType='caption1'
                    >
                      삭제
                    </TextButton>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className='shrink-0 p-4 border-t border-gray-800'>
        {isCreating ? (
          <div className='flex gap-2'>
            <input
              data-testid='manage-create-input'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.partyroom.queue.create_playlist_placeholder}
              className='flex-1 min-w-0 rounded bg-gray-800 px-3 py-2 text-gray-50 outline-none'
            />
            <Button data-testid='manage-create-submit' onClick={handleCreate}>
              {t.partyroom.queue.create_playlist_submit}
            </Button>
          </div>
        ) : (
          <Button
            data-testid='manage-create-cta'
            variant='outline'
            color='secondary'
            onClick={() => setIsCreating(true)}
            className='w-full'
          >
            {t.partyroom.queue.create_playlist_cta}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PlaylistsManagementSheet;
```

> ⚠️ `PlaylistDetailSheet` import 가 Task 4 에서 생성되므로, 본 Task 의 컴파일을 위해 **Task 4 의 Step 3(컴포넌트 최소 구현)을 먼저 만들거나** 임시 stub(`const PlaylistDetailSheet = () => null`)로 시작 후 Task 4 에서 교체. 권장: Task 4 컴포넌트 먼저 stub 생성 → Task 3 → Task 4 테스트.
> ⚠️ `TextButton` 의 `data-testid`/`typographyType`/`onClick` prop 은 `select-playlist.component.tsx:36-42` 에서 동일 사용 확인됨. `Button`/`Typography`/input 클래스는 기존 sheet 와 정합. 실제 prop 명은 구현 시 컴포넌트 시그니처로 재확인.

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/widgets-mobile/partyroom-djing-sheet/ui/playlists-management-sheet.component.test.tsx`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add src/widgets-mobile/partyroom-djing-sheet/ui/playlists-management-sheet.component.tsx src/widgets-mobile/partyroom-djing-sheet/ui/playlists-management-sheet.component.test.tsx
git commit -m "feat(mobile): 플레이리스트 관리 L1 sheet (목록·생성·삭제)"
```

---

### Task 4: `PlaylistDetailSheet` (L2 — 곡 목록 + 삭제 + [+곡추가])

**Files:**

- Create: `src/widgets-mobile/partyroom-djing-sheet/ui/playlist-detail-sheet.component.tsx`
- Test: `src/widgets-mobile/partyroom-djing-sheet/ui/playlist-detail-sheet.component.test.tsx`

동작(spec §7.2):

- props `{ playlist: Playlist }`. `useFetchPlaylistTracks(playlist.id)` → `.content`(PlaylistTrack[]).
- 곡 카드: `thumbnailImage`(img) + `name` + `[×]`. `[×]` → `removeTrack.mutate({ playlistId: playlist.id, trackId })`. **confirm 없음**.
- footer `[+ 곡 추가]` → `push({ key: 'add-tracks', title: t.partyroom.queue.sheet_add_tracks_title, node: <AddTracksSheet playlistId={playlist.id} /> })`.
- empty(`content.length === 0`) → 안내 + `[+ 곡 추가]` CTA.

- [ ] **Step 1: 실패 테스트 작성**

```tsx
// playlist-detail-sheet.component.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { PlaylistType } from '@/shared/api/http/types/@enums';
import PlaylistDetailSheet from './playlist-detail-sheet.component';

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    partyroom: {
      queue: {
        playlist_tracks_empty: '아직 곡이 없어요',
        add_tracks_cta: '+ 곡 추가',
        sheet_add_tracks_title: '곡 추가',
      },
    },
  }),
}));

const useFetchPlaylistTracksMock = vi.fn();
vi.mock('@/features/playlist/list-tracks/api/use-fetch-playlist-tracks.query', () => ({
  useFetchPlaylistTracks: (id: number) => useFetchPlaylistTracksMock(id),
}));
const removeTrackMock = vi.fn();
vi.mock('@/features/playlist/remove-track/api/use-remove-playlist-track.mutation', () => ({
  useRemovePlaylistTrack: () => ({ mutate: removeTrackMock, isPending: false }),
}));
const pushMock = vi.fn();
vi.mock('@/widgets-mobile/partyroom-djing-sheet', () => ({
  useFullscreenSheet: () => ({ push: pushMock, pop: vi.fn() }),
}));
// AddTracksSheet 는 push node 로만 쓰이므로 stub
vi.mock('./add-tracks-sheet.component', () => ({ default: () => null }));

const PL = { id: 7, name: 'A', musicCount: 2, type: PlaylistType.PLAYLIST, orderNumber: 1 };
const TRACK = {
  trackId: 11,
  linkId: 'v1',
  name: '곡1',
  orderNumber: 1,
  duration: '3:00',
  thumbnailImage: 'https://t',
};

describe('PlaylistDetailSheet', () => {
  beforeEach(() => {
    removeTrackMock.mockReset();
    pushMock.mockReset();
  });

  test('곡 목록 렌더', () => {
    useFetchPlaylistTracksMock.mockReturnValue({ data: { content: [TRACK] } });
    render(<PlaylistDetailSheet playlist={PL as never} />);
    expect(screen.getByText('곡1')).toBeInTheDocument();
  });

  test('곡 [×] → removeTrack.mutate({ playlistId, trackId }) (confirm 없음)', async () => {
    useFetchPlaylistTracksMock.mockReturnValue({ data: { content: [TRACK] } });
    render(<PlaylistDetailSheet playlist={PL as never} />);
    await userEvent.click(screen.getByTestId('detail-track-remove-11'));
    expect(removeTrackMock).toHaveBeenCalledWith({ playlistId: 7, trackId: 11 });
  });

  test('[+ 곡 추가] → add-tracks sheet push (playlistId 전달)', async () => {
    useFetchPlaylistTracksMock.mockReturnValue({ data: { content: [TRACK] } });
    render(<PlaylistDetailSheet playlist={PL as never} />);
    await userEvent.click(screen.getByTestId('detail-add-tracks'));
    expect(pushMock).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'add-tracks', title: '곡 추가' })
    );
  });

  test('empty → 안내 + [+ 곡 추가] CTA', () => {
    useFetchPlaylistTracksMock.mockReturnValue({ data: { content: [] } });
    render(<PlaylistDetailSheet playlist={PL as never} />);
    expect(screen.getByText('아직 곡이 없어요')).toBeInTheDocument();
    expect(screen.getByTestId('detail-add-tracks')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/widgets-mobile/partyroom-djing-sheet/ui/playlist-detail-sheet.component.test.tsx`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: 최소 구현**

```tsx
// playlist-detail-sheet.component.tsx
'use client';
import { FC } from 'react';
import { useFetchPlaylistTracks } from '@/features/playlist/list-tracks/api/use-fetch-playlist-tracks.query';
import { useRemovePlaylistTrack } from '@/features/playlist/remove-track/api/use-remove-playlist-track.mutation';
import { Playlist } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { Typography } from '@/shared/ui/components/typography';
import { useFullscreenSheet } from '@/widgets-mobile/partyroom-djing-sheet';
import AddTracksSheet from './add-tracks-sheet.component';

interface Props {
  playlist: Playlist;
}

const PlaylistDetailSheet: FC<Props> = ({ playlist }) => {
  const t = useI18n();
  const { push } = useFullscreenSheet();
  const { data } = useFetchPlaylistTracks(playlist.id);
  const { mutate: removeTrack } = useRemovePlaylistTrack();
  const tracks = data?.content ?? [];

  const openAddTracks = () =>
    push({
      key: 'add-tracks',
      title: t.partyroom.queue.sheet_add_tracks_title,
      node: <AddTracksSheet playlistId={playlist.id} />,
    });

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 overflow-y-auto'>
        {tracks.length === 0 ? (
          <div className='flex h-full items-center justify-center px-4'>
            <Typography type='body3' className='text-gray-400'>
              {t.partyroom.queue.playlist_tracks_empty}
            </Typography>
          </div>
        ) : (
          <ul className='flex flex-col divide-y divide-gray-800'>
            {tracks.map((track) => (
              <li key={track.trackId} className='flex items-center gap-3 px-4 py-3'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={track.thumbnailImage ?? '/images/ETC/PlaylistThumbnail.png'}
                  alt={track.name}
                  className='w-[64px] h-[36px] shrink-0 rounded object-cover bg-gray-700'
                />
                <Typography type='caption1' className='flex-1 min-w-0 truncate text-gray-50'>
                  {track.name}
                </Typography>
                <button
                  type='button'
                  data-testid={`detail-track-remove-${track.trackId}`}
                  onClick={() => removeTrack({ playlistId: playlist.id, trackId: track.trackId })}
                  className='shrink-0 px-2 py-1 text-gray-400'
                  aria-label={t.partyroom.queue.add_tracks_cta}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className='shrink-0 p-4 border-t border-gray-800'>
        <Button data-testid='detail-add-tracks' onClick={openAddTracks} className='w-full'>
          {t.partyroom.queue.add_tracks_cta}
        </Button>
      </div>
    </div>
  );
};

export default PlaylistDetailSheet;
```

> img 는 외부 썸네일 → Next/Image 최적화 쿼터 회피 위해 plain `<img>`([[reference_vercel_image_optimization_402]] 정신과 동일, 고볼륨 외부 CDN). desktop `track.component.tsx` 는 `ThumbnailWithPreview` 사용하나 그건 preview 기능 포함 — MVP 곡 카드엔 불필요. reviewer 확인 사항.

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/widgets-mobile/partyroom-djing-sheet/ui/playlist-detail-sheet.component.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/widgets-mobile/partyroom-djing-sheet/ui/playlist-detail-sheet.component.tsx src/widgets-mobile/partyroom-djing-sheet/ui/playlist-detail-sheet.component.test.tsx
git commit -m "feat(mobile): 플레이리스트 상세 L2 sheet (곡 목록·삭제·곡추가)"
```

---

### Task 5: `MemberActions` secondary 액션 + `queue-panel` wiring

**Files:**

- Modify: `src/widgets-mobile/partyroom-queue-panel/ui/member-actions.component.tsx`
- Modify: `src/widgets-mobile/partyroom-queue-panel/ui/member-actions.component.test.tsx`
- Modify: `src/widgets-mobile/partyroom-queue-panel/ui/queue-panel.component.tsx`

설계: `MemberActions` 에 prop `onManagePlaylists: () => void` 추가 + register/unregister 버튼 위에 secondary TextButton("내 플레이리스트 관리"). queue-panel 은 `const openManage = useOpenPlaylistsManagement()` 로 받아 prop 전달. (MemberActions 는 presentational 유지 — 콜백만 받음.)

- [ ] **Step 1: 실패 테스트 추가 (member-actions)**

기존 `member-actions.component.test.tsx` 의 i18n mock 에 `member_action_manage_playlists: '내 플레이리스트 관리'` 추가 후, 테스트 추가:

```tsx
test('secondary "내 플레이리스트 관리" 렌더 + 클릭 → onManagePlaylists', async () => {
  const onManage = vi.fn();
  render(
    <MemberActions
      isMeInQueue={false}
      onRegister={vi.fn()}
      onUnregister={vi.fn()}
      onManagePlaylists={onManage}
    />
  );
  await userEvent.click(screen.getByTestId('member-action-manage-playlists'));
  expect(onManage).toHaveBeenCalledTimes(1);
});
```

(기존 3개 테스트의 `<MemberActions .../>` 에도 `onManagePlaylists={vi.fn()}` prop 추가 — 필수 prop 이면 컴파일 위해.)

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/widgets-mobile/partyroom-queue-panel/ui/member-actions.component.test.tsx`
Expected: FAIL (prop/testid 없음)

- [ ] **Step 3: MemberActions 구현 수정**

```tsx
'use client';
import { FC } from 'react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { TextButton } from '@/shared/ui/components/text-button';

interface Props {
  isMeInQueue: boolean;
  onRegister: () => void;
  onUnregister: () => void;
  onManagePlaylists: () => void;
}

const MemberActions: FC<Props> = ({ isMeInQueue, onRegister, onUnregister, onManagePlaylists }) => {
  const t = useI18n();
  return (
    <div className='shrink-0 flex flex-col gap-2 p-4 border-t border-gray-800'>
      <TextButton
        data-testid='member-action-manage-playlists'
        onClick={onManagePlaylists}
        className='self-center text-gray-300'
        typographyType='caption1'
      >
        {t.partyroom.queue.member_action_manage_playlists}
      </TextButton>
      {isMeInQueue ? (
        <Button
          data-testid='member-action-unregister'
          color='secondary'
          variant='outline'
          onClick={onUnregister}
          className='w-full'
        >
          {t.partyroom.queue.member_action_unregister}
        </Button>
      ) : (
        <Button data-testid='member-action-register' onClick={onRegister} className='w-full'>
          {t.partyroom.queue.member_action_register}
        </Button>
      )}
    </div>
  );
};

export default MemberActions;
```

- [ ] **Step 4: member-actions 테스트 통과 확인**

Run: `npx vitest run src/widgets-mobile/partyroom-queue-panel/ui/member-actions.component.test.tsx`
Expected: PASS

- [ ] **Step 5: queue-panel wiring 수정 + 테스트**

`queue-panel.component.tsx`:

- import: `import { useOpenPlaylistsManagement } from '@/features-mobile/playlist/manage';`
- `QueuePanelContent` 안 (멤버 분기 위, hook 규칙 준수): `const openManage = useOpenPlaylistsManagement();`
- `<MemberActions ... onManagePlaylists={openManage} />`

`queue-panel.component.test.tsx`: 상단에 mock 추가

```tsx
vi.mock('@/features-mobile/playlist/manage', () => ({
  useOpenPlaylistsManagement: () => vi.fn(),
}));
```

그리고 i18n mock 의 `partyroom.queue` 에 `member_action_manage_playlists: '내 플레이리스트 관리'` 추가. 기존 멤버 분기 테스트에 `expect(screen.getByTestId('member-action-manage-playlists')).toBeInTheDocument();` 1줄 추가(멤버 케이스), 게스트 케이스엔 `queryByTestId(...).not.toBeInTheDocument()` 확인.

- [ ] **Step 6: queue-panel 테스트 통과 확인 (게스트/멤버 회귀 0)**

Run: `npx vitest run src/widgets-mobile/partyroom-queue-panel`
Expected: PASS (기존 4 + 추가 assertion)

- [ ] **Step 7: Commit**

```bash
git add src/widgets-mobile/partyroom-queue-panel
git commit -m "feat(mobile): queue 탭 MemberActions 에 플레이리스트 관리 진입점"
```

---

### Task 6: `useMobileSelectPlaylist` 빈-플리 회귀 보정 (chunk 4 §10)

**Files:**

- Modify: `src/features-mobile/partyroom/select-playlist-for-djing/ui/use-mobile-select-playlist.hook.tsx:35-42`
- Modify: `src/features-mobile/partyroom/select-playlist-for-djing/ui/use-mobile-select-playlist.hook.test.tsx`

변경: 빈 플리(`playlists.length === 0`) 분기에서 `openConfirmDialog` + `router.push('/me/playlist')` 제거 → `openManage()`(L1 push) 호출 후 `return undefined`. `useRouter`/`openConfirmDialog`/`t.dj.para.create_playlist_song` 의존 제거.

- [ ] **Step 1: 테스트 갱신 (회귀 의도 변경 반영)**

`use-mobile-select-playlist.hook.test.tsx`:

- mock 추가:

```tsx
const openManageMock = vi.fn();
vi.mock('@/features-mobile/playlist/manage', () => ({
  useOpenPlaylistsManagement: () => openManageMock,
}));
```

- 기존 test 1(`playlists=[] → confirm → /me/playlist push`) **교체**:

```tsx
test('playlists=[] → 관리 sheet(openManage) push + router.push 안 함 + resolve(undefined)', async () => {
  const { result } = renderHook(() => useMobileSelectPlaylist({ playlists: [] }), {
    wrapper: wrap,
  });
  const promise = result.current();
  await expect(promise).resolves.toBeUndefined();
  expect(openManageMock).toHaveBeenCalledTimes(1);
  expect(pushMock).not.toHaveBeenCalled(); // router.push (next/navigation)
});
```

- 기존 test 2(`confirm 취소`) **삭제**(confirm 분기 자체가 사라짐).
- test 3(`every musicCount===0 → SelectPlaylistSheet push`)는 유지(정상 분기 회귀 0 보장).
- `beforeEach` 에 `openManageMock.mockReset()` 추가.

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/features-mobile/partyroom/select-playlist-for-djing/ui/use-mobile-select-playlist.hook.test.tsx`
Expected: FAIL (아직 openManage 미사용, router.push 호출 중)

- [ ] **Step 3: 구현 수정**

```tsx
// use-mobile-select-playlist.hook.tsx (해당 부분만)
import { useOpenPlaylistsManagement } from '@/features-mobile/playlist/manage';
// ... useRouter / useDialog import 제거(다른 곳에서 안 쓰면)

export default function useMobileSelectPlaylist({
  playlists,
}: Args): () => Promise<Playlist | void> {
  const t = useI18n();
  const { push, pop } = useFullscreenSheet();
  const openManage = useOpenPlaylistsManagement();

  return useCallback(async () => {
    if (playlists.length === 0) {
      openManage();
      return undefined;
    }

    return new Promise<Playlist | void>((resolve) => {
      push({
        key: 'select-playlist',
        title: t.partyroom.queue.sheet_select_playlist_title,
        node: (
          <SelectPlaylistSheet
            playlists={playlists}
            onConfirm={(p) => {
              resolve(p);
              pop();
            }}
            onCancel={() => {
              resolve(undefined);
              pop();
            }}
            onAddTracksForEmpty={(p) => {
              push({
                key: 'add-tracks',
                title: t.partyroom.queue.sheet_add_tracks_title,
                node: <AddTracksSheet playlistId={p.id} />,
              });
            }}
          />
        ),
        onClose: () => resolve(undefined),
      });
    });
  }, [
    playlists,
    openManage,
    push,
    pop,
    t.partyroom.queue.sheet_select_playlist_title,
    t.partyroom.queue.sheet_add_tracks_title,
  ]);
}
```

> ⚠️ `useRouter`·`useDialog`·`t.dj.para.create_playlist_song` import/사용 모두 제거. dep array 에서도 제거. 미사용 import 남으면 lint 실패.

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/features-mobile/partyroom/select-playlist-for-djing`
Expected: PASS (정상 분기 회귀 0)

- [ ] **Step 5: Commit**

```bash
git add src/features-mobile/partyroom/select-playlist-for-djing
git commit -m "fix(mobile): DJ 등록 빈-플리 시 데스크탑 페이지 대신 관리 sheet (#chunk6 회귀보정)"
```

---

### Task 7: 전체 검증 + 로컬 수동 확인

- [ ] **Step 1: 전체 단위/통합 테스트**

Run: `npx vitest run`
Expected: 전부 PASS, 신규/회귀 0 실패

- [ ] **Step 2: typecheck**

Run: `npx tsc --noEmit`
Expected: 0 에러

- [ ] **Step 3: lint**

Run: `npx eslint src/widgets-mobile/partyroom-djing-sheet src/widgets-mobile/partyroom-queue-panel src/features-mobile/playlist/manage src/features-mobile/partyroom/select-playlist-for-djing`
Expected: clean (미사용 import 0)

- [ ] **Step 4: 로컬 headed 수동 확인** ([[reference_pfplay_web_local_dev_http_webpack]])

Run: `npx next dev` (http, webpack — `yarn dev` 금지)
확인 시나리오:

1. 멤버로 룸 입장 → queue 탭 → "내 플레이리스트 관리" → L1 목록.
2. [+ 새 플레이리스트] → 생성 → 목록 갱신.
3. 카드 클릭 → L2 곡 목록 → [+ 곡 추가] → L3 검색·추가 → 뒤로 → L2 갱신.
4. 곡 [×] 삭제 / 일반 플리 삭제(confirm) / Grab 플리 삭제버튼 없음.
5. **회귀 경로**: 곡 없는 상태에서 DJ 등록 시도 → `/me/playlist` 로 안 튕기고 관리 sheet 진입.
6. 게스트로 입장 → queue 탭에 "내 플레이리스트 관리" 안 보임.
7. ESC/뒤로가기로 sheet stack pop 정상.

- [ ] **Step 5: push 전 커밋 정리** ([[feedback_commit_consolidation_before_push]])

논리 단위 squash 검토(필요 시). base `development`.

- [ ] **Step 6: PR 생성** (한글, [[feedback_korean_issue_commit_pr]])

base `development`. 제목/본문 한글, spec·plan 링크, closes #<이슈번호>. CI(vercel-preview-e2e) GREEN 대기. **release/main = 사용자 게이트.**

---

## 검증 요약

- 단위/통합: `npx vitest run` GREEN
- typecheck: `npx tsc --noEmit` 0
- lint: clean
- 로컬 headed: 4-level stack 왕복 + 회귀 경로 + 게스트 차단
- E2E: chunk 4/5 E2E 부담([[reference_e2e_preview_alias_race]]) 고려 — 신규 E2E spec 은 happy-path 1개만 선택적(reviewer 판단). 기본은 단위/통합 + 로컬 headed 로 충분.
