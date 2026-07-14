# 채팅 이모지셋 구현 플랜 (#439)

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 파티룸 채팅 입력창에 큐레이션 유니코드 이모지 피커(40개 + 최근 사용 8개)를 데스크탑/모바일 공용으로 추가한다. pfplay-web 단독, 백엔드 무변경.

**Architecture:** `features/partyroom/send-chat-message` feature 내부에 Headless UI v2 `Popover` 기반 `ChatEmojiPicker`(트리거+패널 일체)를 신설하고, 데스크탑/모바일 채팅 패널 각각의 `Input` `Suffix`에 전송 버튼과 나란히 마운트한다. 선택 시 render-prop의 `setMessage`로 끝에 append, 패널은 연속 선택을 위해 유지, 닫힐 때 입력창 포커스 복귀. 최근 사용은 localStorage MRU.

**Tech Stack:** Next.js 14 / React 18 / TypeScript / Tailwind / @headlessui/react 2.1 / vitest + testing-library / Playwright e2e

**Spec:** `docs/superpowers/specs/2026-07-11-chat-emoji-set-design.md`
**Branch:** `feat/chat-emoji-set-439` (origin/development 분기, 스펙 커밋 완료 상태)
**Working dir:** `C:\Users\Eisen\Desktop\Labs\[projects] pfplay\pfplay-web`

**스펙 리뷰 반영 사항 (설계 확정):**

- 포커스 복귀 ↔ 팝오버 유지 충돌: 선택 시에는 포커스를 옮기지 않는다(Headless UI Popover는 focus-out 시 닫히므로). 대신 **패널이 닫힌 뒤**(`open` true→false 전이) `onClosed` 콜백으로 입력창 포커스 복귀.
- `inputRef` 소유권: **패널(widget) 측**이 ref를 만들어 `Input`에 넘기고, `onClosed`에서 `.focus()` 호출.
- `addRecent` 호출 주체: **`ChatEmojiPicker` 내부**가 훅을 직접 사용(마운트 측은 `onSelect`만 받음).
- `❤️`는 VS16(U+FE0F) 포함 — 테스트/비교는 raw string 그대로, 정규화 금지.

**기존 코드 확인된 사실 (재검증 불필요):**

- `SendMessage` render-prop: `{ message, setMessage, send, canSend }` (`src/features/partyroom/send-chat-message/ui/send-chat-message.component.tsx`)
- `Input`은 `forwardRef<HTMLInputElement>` + `Suffix?: ReactNode` 지원, 래퍼 클릭 시 `closest('button')` 가드로 버튼 클릭과 무충돌 (`src/shared/ui/components/input/input.component.tsx`)
- svgr: `public/icons/<Group>/icn_<name>.svg` → `yarn svgr` → `src/shared/ui/icons/<group>/PF<Name>.tsx` 전체 재생성 + index 재작성. `white`/`#fff`는 `currentColor`로 치환됨 (`scripts/svgr.js`)
- headlessui v2 `anchor` 패턴 + jsdom 테스트에서 `ResizeObserver` 스텁 선례: `src/shared/ui/components/menu/menu-item-panel.component.{tsx,test.tsx}`
- i18n: `src/shared/lib/localization/dictionaries/{ko,en}.json` 직접 수정 (`yarn i18n` 실행 금지 — 사용자 룰), `chat` 키는 현재 `para`만 존재
- e2e 헬퍼: `sendChatMessage`/`waitForChatMessage` (`e2e/helpers/partyroom.helpers.ts:320,456`), 채팅 시나리오는 `e2e/e2e-d.profile-avatar-reaction-chat.spec.ts`

---

## Chunk 1: 라이브러리 계층 (emoji-set + recents 훅 + 아이콘 + i18n)

### Task 1: `emoji-set.ts` 상수

**Files:**

- Create: `src/features/partyroom/send-chat-message/lib/emoji-set.ts`
- Test: `src/features/partyroom/send-chat-message/lib/emoji-set.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
// src/features/partyroom/send-chat-message/lib/emoji-set.test.ts
import { CHAT_EMOJIS } from './emoji-set';

describe('CHAT_EMOJIS (#439)', () => {
  test('40개 고정', () => {
    expect(CHAT_EMOJIS).toHaveLength(40);
  });

  test('중복 없음 (raw string 비교 — VS16 정규화 금지)', () => {
    expect(new Set<string>(CHAT_EMOJIS).size).toBe(CHAT_EMOJIS.length);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `yarn vitest run src/features/partyroom/send-chat-message/lib/emoji-set.test.ts`
Expected: FAIL — `Cannot find module './emoji-set'`

- [ ] **Step 3: 구현**

```ts
// src/features/partyroom/send-chat-message/lib/emoji-set.ts
/**
 * 채팅 이모지 피커 큐레이션 셋 (#439).
 * 전부 Emoji 11.0(2018) 이하 — Windows 10(Segoe UI Emoji)·구형 모바일에서 두부(□) 없음.
 * Emoji 12+(🥹 🫶 🪩 🫠 등)는 의도적으로 제외. 추가 시 유니코드 버전 확인 필수.
 */
export const CHAT_EMOJIS = [
  '🎧',
  '🎵',
  '🎶',
  '🎤',
  '🎹',
  '🥁',
  '🎸',
  '🎷',
  '📀',
  '🔥',
  '✨',
  '🎉',
  '💃',
  '🕺',
  '👏',
  '🙌',
  '🤘',
  '🤙',
  '💪',
  '❤️',
  '💜',
  '😍',
  '🤩',
  '😎',
  '🥳',
  '😊',
  '😆',
  '😂',
  '🤣',
  '😭',
  '😅',
  '😮',
  '🤔',
  '😴',
  '👍',
  '👎',
  '🙏',
  '💯',
  '🍻',
  '🥂',
] as const;
```

- [ ] **Step 4: 통과 확인**

Run: `yarn vitest run src/features/partyroom/send-chat-message/lib/emoji-set.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/features/partyroom/send-chat-message/lib/emoji-set.ts src/features/partyroom/send-chat-message/lib/emoji-set.test.ts
git commit -m "feat(chat): 이모지 피커 큐레이션 셋 40개 상수 (#439)"
```

### Task 2: `use-recent-emojis` 훅

**Files:**

- Create: `src/features/partyroom/send-chat-message/lib/use-recent-emojis.hook.ts`
- Test: `src/features/partyroom/send-chat-message/lib/use-recent-emojis.hook.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```tsx
// src/features/partyroom/send-chat-message/lib/use-recent-emojis.hook.test.ts
import { act, renderHook, waitFor } from '@testing-library/react';
import useRecentEmojis, { RECENT_EMOJIS_STORAGE_KEY } from './use-recent-emojis.hook';

describe('useRecentEmojis (#439)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  test('초기값은 빈 배열, 마운트 후 localStorage에서 로드', async () => {
    localStorage.setItem(RECENT_EMOJIS_STORAGE_KEY, JSON.stringify(['🔥', '🎉']));
    const { result } = renderHook(() => useRecentEmojis());
    await waitFor(() => expect(result.current.recents).toEqual(['🔥', '🎉']));
  });

  test('addRecent — MRU 맨 앞 삽입 + 중복 제거', async () => {
    const { result } = renderHook(() => useRecentEmojis());
    act(() => result.current.addRecent('🎧'));
    act(() => result.current.addRecent('🔥'));
    act(() => result.current.addRecent('🎧'));
    expect(result.current.recents).toEqual(['🎧', '🔥']);
    expect(JSON.parse(localStorage.getItem(RECENT_EMOJIS_STORAGE_KEY)!)).toEqual(['🎧', '🔥']);
  });

  test('최대 8개 절삭 — 가장 오래된 항목 탈락', async () => {
    const seed = ['1', '2', '3', '4', '5', '6', '7', '8'];
    localStorage.setItem(RECENT_EMOJIS_STORAGE_KEY, JSON.stringify(seed));
    const { result } = renderHook(() => useRecentEmojis());
    await waitFor(() => expect(result.current.recents).toHaveLength(8));
    act(() => result.current.addRecent('9'));
    expect(result.current.recents).toEqual(['9', '1', '2', '3', '4', '5', '6', '7']);
  });

  test('저장 실패(프라이빗 모드 등)여도 메모리 recents는 갱신', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const { result } = renderHook(() => useRecentEmojis());
    expect(() => act(() => result.current.addRecent('🔥'))).not.toThrow();
    expect(result.current.recents).toEqual(['🔥']);
  });

  test('저장값이 손상(JSON 아님/배열 아님)이어도 빈 배열로 동작', async () => {
    localStorage.setItem(RECENT_EMOJIS_STORAGE_KEY, 'not-json{');
    const { result } = renderHook(() => useRecentEmojis());
    // 마운트 로드가 끝난 뒤에도 여전히 빈 배열이어야 한다
    await waitFor(() => expect(result.current.recents).toEqual([]));
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `yarn vitest run src/features/partyroom/send-chat-message/lib/use-recent-emojis.hook.test.ts`
Expected: FAIL — 모듈 없음

- [ ] **Step 3: 구현**

```tsx
// src/features/partyroom/send-chat-message/lib/use-recent-emojis.hook.ts
'use client';
import { useEffect, useState } from 'react';

export const RECENT_EMOJIS_STORAGE_KEY = 'pfplay:chat:recent-emojis';
const MAX_RECENTS = 8;

function loadRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_EMOJIS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === 'string').slice(0, MAX_RECENTS);
  } catch {
    return [];
  }
}

/**
 * 채팅 이모지 최근 사용 MRU (#439).
 * SSR/hydration 안전: 초기 [] → 마운트 후 로드. localStorage 불가 환경은 메모리로만 동작.
 */
export default function useRecentEmojis() {
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    setRecents(loadRecents());
  }, []);

  const addRecent = (emoji: string) => {
    // updater 내부 부수효과 금지(StrictMode 이중 호출) — next를 밖에서 계산해 저장
    const next = [emoji, ...recents.filter((e) => e !== emoji)].slice(0, MAX_RECENTS);
    try {
      localStorage.setItem(RECENT_EMOJIS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // 프라이빗 모드 등 저장 불가 환경 — 세션 메모리로만 유지
    }
    setRecents(next);
  };

  return { recents, addRecent };
}
```

- [ ] **Step 4: 통과 확인**

Run: `yarn vitest run src/features/partyroom/send-chat-message/lib/use-recent-emojis.hook.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/features/partyroom/send-chat-message/lib/use-recent-emojis.hook.ts src/features/partyroom/send-chat-message/lib/use-recent-emojis.hook.test.ts
git commit -m "feat(chat): 이모지 최근 사용 MRU 훅 — localStorage 8개 (#439)"
```

### Task 3: `PFEmoji` 아이콘 (에셋 — TDD 비대상)

**Files:**

- Create: `public/icons/Chat/icn_emoji.svg`
- Generated: `src/shared/ui/icons/chat/PFEmoji.tsx` + `src/shared/ui/icons/index.tsx` (yarn svgr가 전체 재생성)

- [ ] **Step 1: SVG 파일 생성** (Material Design `mood` 아이콘, Apache 2.0 — 기존 아이콘들과 동일한 24×24 · fill white 컨벤션)

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM15.5 11C16.33 11 17 10.33 17 9.5C17 8.67 16.33 8 15.5 8C14.67 8 14 8.67 14 9.5C14 10.33 14.67 11 15.5 11ZM8.5 11C9.33 11 10 10.33 10 9.5C10 8.67 9.33 8 8.5 8C7.67 8 7 8.67 7 9.5C7 10.33 7.67 11 8.5 11ZM12 17.5C14.33 17.5 16.31 16.04 17.11 14H6.89C7.69 16.04 9.67 17.5 12 17.5Z" fill="white"/>
</svg>
```

- [ ] **Step 2: svgr 실행 + 생성 확인**

Run: `yarn svgr`
Expected: `src/shared/ui/icons/chat/PFEmoji.tsx` 생성, `index.tsx`에 `export { default as PFEmoji } from './chat/PFEmoji';` 추가됨. `git status`에서 **다른 아이콘 파일의 의도치 않은 diff가 없는지 확인**(전체 재생성 스크립트이므로 — diff가 나면 도구 버전 차이니 해당 파일은 체크아웃으로 되돌리고 PFEmoji 관련만 스테이징).

- [ ] **Step 3: 타입 확인**

Run: `yarn test:type`
Expected: PASS

- [ ] **Step 4: 커밋**

```bash
git add public/icons/Chat/icn_emoji.svg src/shared/ui/icons/chat/PFEmoji.tsx src/shared/ui/icons/index.tsx
git commit -m "feat(icons): 이모지 피커 트리거용 PFEmoji 아이콘 추가 (#439)"
```

### Task 4: i18n 키 추가

**Files:**

- Modify: `src/shared/lib/localization/dictionaries/ko.json` (`chat` 키)
- Modify: `src/shared/lib/localization/dictionaries/en.json` (`chat` 키)

- [ ] **Step 1: 두 사전에 동일 구조로 키 추가** (⚠️ `yarn i18n` 실행 금지 — json 직접 수정, ko/en drift 금지)

ko.json의 `chat` 객체에 (`para` 형제로):

```json
"btn": {
  "choose_emoji": "이모지 선택"
},
"title": {
  "recently_used": "최근 사용"
}
```

en.json의 `chat` 객체에:

```json
"btn": {
  "choose_emoji": "Choose emoji"
},
"title": {
  "recently_used": "Recently used"
}
```

- [ ] **Step 2: 타입/기존 테스트 확인**

Run: `yarn test:type && yarn vitest run src/shared/lib/localization`
Expected: PASS (사전 타입은 json에서 파생 — 양쪽 동일 구조면 그린)

- [ ] **Step 3: 커밋**

```bash
git add src/shared/lib/localization/dictionaries/ko.json src/shared/lib/localization/dictionaries/en.json
git commit -m "feat(i18n): 채팅 이모지 피커 문구 ko/en 추가 (#439)"
```

## Chunk 2: ChatEmojiPicker 컴포넌트

### Task 5: `ChatEmojiPicker` 컴포넌트 (TDD)

**Files:**

- Create: `src/features/partyroom/send-chat-message/ui/chat-emoji-picker.component.tsx`
- Test: `src/features/partyroom/send-chat-message/ui/chat-emoji-picker.component.test.tsx`
- Modify: `src/features/partyroom/send-chat-message/index.ts` (export 추가)

- [ ] **Step 1: 실패하는 테스트 작성** — 실제 headlessui 사용(mock 아님) + `ResizeObserver` 스텁(선례: `menu-item-panel.component.test.tsx`). `useI18n`만 mock.

```tsx
// src/features/partyroom/send-chat-message/ui/chat-emoji-picker.component.test.tsx
global.ResizeObserver = class ResizeObserver {
  public observe() {
    /* noop */
  }
  public unobserve() {
    /* noop */
  }
  public disconnect() {
    /* noop */
  }
} as any;

vi.mock('@/shared/lib/localization/i18n.context');

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { CHAT_EMOJIS } from '../lib/emoji-set';
import { RECENT_EMOJIS_STORAGE_KEY } from '../lib/use-recent-emojis.hook';
import ChatEmojiPicker from './chat-emoji-picker.component';

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  (useI18n as Mock).mockReturnValue({
    chat: {
      btn: { choose_emoji: '이모지 선택' },
      title: { recently_used: '최근 사용' },
    },
  });
});

describe('ChatEmojiPicker (#439)', () => {
  test('트리거 클릭 → 패널 열림 + 이모지 40개 렌더', async () => {
    const user = userEvent.setup();
    render(<ChatEmojiPicker onSelect={vi.fn()} />);

    await user.click(screen.getByTestId('chat-emoji-trigger'));

    const panel = await screen.findByTestId('chat-emoji-panel');
    expect(panel).toBeInTheDocument();
    expect(screen.getByTestId('chat-emoji-grid').children).toHaveLength(CHAT_EMOJIS.length);
  });

  test('이모지 클릭 → onSelect 호출 + 패널 유지 + recents 저장', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<ChatEmojiPicker onSelect={onSelect} />);

    await user.click(screen.getByTestId('chat-emoji-trigger'));
    await screen.findByTestId('chat-emoji-panel');
    await user.click(screen.getByRole('button', { name: '🎧' }));

    expect(onSelect).toHaveBeenCalledWith('🎧');
    expect(screen.getByTestId('chat-emoji-panel')).toBeInTheDocument(); // 연속 선택 위해 유지
    expect(JSON.parse(localStorage.getItem(RECENT_EMOJIS_STORAGE_KEY)!)).toEqual(['🎧']);
  });

  test('disabled → 클릭해도 패널이 열리지 않는다', async () => {
    const user = userEvent.setup();
    render(<ChatEmojiPicker onSelect={vi.fn()} disabled />);

    await user.click(screen.getByTestId('chat-emoji-trigger'));

    expect(screen.queryByTestId('chat-emoji-panel')).not.toBeInTheDocument();
  });

  test('recents 비어 있으면 최근 사용 섹션 미표시, 시드되어 있으면 표시', async () => {
    const user = userEvent.setup();
    localStorage.setItem(RECENT_EMOJIS_STORAGE_KEY, JSON.stringify(['🔥', '🎉']));
    render(<ChatEmojiPicker onSelect={vi.fn()} />);

    await user.click(screen.getByTestId('chat-emoji-trigger'));
    await screen.findByTestId('chat-emoji-panel');

    const recents = await screen.findByTestId('chat-emoji-recents');
    expect(recents.children).toHaveLength(2);
    expect(recents.children[0]).toHaveTextContent('🔥');
  });

  test('ESC로 닫히면 onClosed 호출 (입력창 포커스 복귀 채널)', async () => {
    const user = userEvent.setup();
    const onClosed = vi.fn();
    render(<ChatEmojiPicker onSelect={vi.fn()} onClosed={onClosed} />);

    await user.click(screen.getByTestId('chat-emoji-trigger'));
    await screen.findByTestId('chat-emoji-panel');
    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByTestId('chat-emoji-panel')).not.toBeInTheDocument());
    await waitFor(() => expect(onClosed).toHaveBeenCalledTimes(1));
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `yarn vitest run src/features/partyroom/send-chat-message/ui/chat-emoji-picker.component.test.tsx`
Expected: FAIL — 컴포넌트 모듈 없음

- [ ] **Step 3: 구현**

```tsx
// src/features/partyroom/send-chat-message/ui/chat-emoji-picker.component.tsx
'use client';
import { useEffect, useRef } from 'react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Typography } from '@/shared/ui/components/typography';
import { PFEmoji } from '@/shared/ui/icons';
import { CHAT_EMOJIS } from '../lib/emoji-set';
import useRecentEmojis from '../lib/use-recent-emojis.hook';

type Props = {
  /** 선택된 이모지 1개 전달 — 호출 측에서 message에 append */
  onSelect: (emoji: string) => void;
  /** 패널이 닫힌 뒤 호출 — 입력창 포커스 복귀용.
   *  선택 시점에 포커스를 옮기면 Popover가 focus-out으로 닫혀버리므로 닫힘 이후에만 복귀시킨다. */
  onClosed?: () => void;
  disabled?: boolean;
};

export default function ChatEmojiPicker({ onSelect, onClosed, disabled }: Props) {
  const t = useI18n();
  const { recents, addRecent } = useRecentEmojis();

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    addRecent(emoji);
  };

  return (
    <Popover className='flex items-center'>
      {({ open }) => (
        <>
          <ClosedWatcher open={open} onClosed={onClosed} />

          <PopoverButton
            data-testid='chat-emoji-trigger'
            aria-label={t.chat.btn.choose_emoji}
            disabled={disabled}
            className='flex items-center justify-center w-[32px] h-[32px] rounded-[4px] text-gray-300 enabled:hover:text-gray-50 disabled:opacity-40 focus:outline-none focus-visible:interaction-outline'
          >
            <PFEmoji width={20} height={20} />
          </PopoverButton>

          <PopoverPanel
            data-testid='chat-emoji-panel'
            anchor='top end'
            className='z-50 w-max rounded-[8px] border border-gray-700 bg-gray-800 p-[12px] shadow-lg focus:outline-none [--anchor-gap:8px]'
          >
            {recents.length > 0 && (
              <div className='mb-[8px]'>
                <Typography type='caption1' className='block text-gray-400 mb-[4px]'>
                  {t.chat.title.recently_used}
                </Typography>
                <div data-testid='chat-emoji-recents' className='flex items-center gap-[2px]'>
                  {recents.map((emoji) => (
                    <EmojiButton key={emoji} emoji={emoji} onClick={handleSelect} />
                  ))}
                </div>
                <div className='border-t border-gray-700 mt-[8px]' />
              </div>
            )}

            <div
              data-testid='chat-emoji-grid'
              className='grid grid-cols-8 gap-[2px] max-h-[204px] overflow-y-auto'
            >
              {CHAT_EMOJIS.map((emoji) => (
                <EmojiButton key={emoji} emoji={emoji} onClick={handleSelect} />
              ))}
            </div>
          </PopoverPanel>
        </>
      )}
    </Popover>
  );
}

function EmojiButton({ emoji, onClick }: { emoji: string; onClick: (emoji: string) => void }) {
  return (
    <button
      type='button'
      onClick={() => onClick(emoji)}
      className='flex items-center justify-center w-[32px] h-[32px] rounded-[4px] text-[20px] leading-none hover:bg-gray-700'
    >
      {emoji}
    </button>
  );
}

/** open true→false 전이 감지 — 닫힘 이후 포커스 복귀 콜백 */
function ClosedWatcher({ open, onClosed }: { open: boolean; onClosed?: () => void }) {
  const prevOpenRef = useRef(open);

  useEffect(() => {
    if (prevOpenRef.current && !open) {
      onClosed?.();
    }
    prevOpenRef.current = open;
  }, [open, onClosed]);

  return null;
}
```

- [ ] **Step 4: 통과 확인**

Run: `yarn vitest run src/features/partyroom/send-chat-message/ui/chat-emoji-picker.component.test.tsx`
Expected: PASS (5 tests). jsdom에서 headlessui anchor 관련 오류가 나면 선례(`menu-item-panel.component.test.tsx`)처럼 headlessui 부분 mock으로 전환하되, 그 경우 open/close 동작 테스트는 트리거 클릭 상태 기반으로 재구성한다.

- [ ] **Step 5: feature 배럴 export 추가**

```ts
// src/features/partyroom/send-chat-message/index.ts — 기존 줄 유지, 아래 추가
export { default as ChatEmojiPicker } from './ui/chat-emoji-picker.component';
```

- [ ] **Step 6: 타입/린트 확인 후 커밋**

Run: `yarn test:type`
Expected: PASS

```bash
git add src/features/partyroom/send-chat-message/ui/chat-emoji-picker.component.tsx src/features/partyroom/send-chat-message/ui/chat-emoji-picker.component.test.tsx src/features/partyroom/send-chat-message/index.ts
git commit -m "feat(chat): ChatEmojiPicker 컴포넌트 — Popover 그리드+최근 사용 (#439)"
```

## Chunk 3: 패널 마운트 + 검증 + e2e

### Task 6: 데스크탑 채팅 패널 마운트

**Files:**

- Modify: `src/widgets/partyroom-chat-panel/ui/partyroom-chat-panel.component.tsx`

- [ ] **Step 1: 마운트 수정** (`useRef`는 이미 import되어 있음)

import 수정:

```tsx
import { SendChatMessage, ChatEmojiPicker } from '@/features/partyroom/send-chat-message';
```

컴포넌트 본문 상단(기존 `banned` 선언 근처)에 추가:

```tsx
const chatInputRef = useRef<HTMLInputElement>(null);
```

`<Input ...>`에 `ref={chatInputRef}` 추가. 기존 `Suffix`(TooltipTrigger로 감싼 전송 Button)를 아래로 교체 — **전송 버튼 자체는 기존 그대로 유지**:

```tsx
Suffix={
  <div className='flex items-center gap-[4px]'>
    <ChatEmojiPicker
      disabled={banned}
      onSelect={(emoji) => setMessage(message + emoji)}
      // Headless UI가 닫힘 시 트리거로 포커스를 되돌리는 것과의 순서 레이스 예방 — 한 프레임 늦게 입력창으로
      onClosed={() => requestAnimationFrame(() => chatInputRef.current?.focus())}
    />
    <TooltipTrigger
      title={!canSend ? (banned ? t.chat.para.chat_banned_hint : undefined) : undefined}
    >
      <Button
        data-testid='chat-message-send-button'
        color='secondary'
        variant='fill'
        Icon={<PFSend width={20} height={20} />}
        size='sm'
        className='text-gray-50'
        onClick={send}
        disabled={!canSend}
      />
    </TooltipTrigger>
  </div>
}
```

- [ ] **Step 2: 검증**

Run: `yarn test:type && yarn lint`
Expected: PASS

- [ ] **Step 3: 커밋**

```bash
git add src/widgets/partyroom-chat-panel/ui/partyroom-chat-panel.component.tsx
git commit -m "feat(chat): 데스크탑 채팅 입력창에 이모지 피커 마운트 (#439)"
```

### Task 7: 모바일 채팅 패널 마운트

**Files:**

- Modify: `src/widgets-mobile/partyroom-chat-panel/partyroom-chat-panel.component.tsx`

- [ ] **Step 1: 동일 패턴 적용** (`useRef` 이미 import됨)

import 수정:

```tsx
import { SendChatMessage, ChatEmojiPicker } from '@/features/partyroom/send-chat-message';
```

본문에 `const chatInputRef = useRef<HTMLInputElement>(null);` 추가, `<Input>`에 `ref={chatInputRef}` 추가, `Suffix`를 교체(모바일 전송 버튼은 TooltipTrigger 없음 — 기존 그대로 유지):

```tsx
Suffix={
  <div className='flex items-center gap-[4px]'>
    <ChatEmojiPicker
      disabled={banned}
      onSelect={(emoji) => setMessage(message + emoji)}
      // Headless UI가 닫힘 시 트리거로 포커스를 되돌리는 것과의 순서 레이스 예방 — 한 프레임 늦게 입력창으로
      onClosed={() => requestAnimationFrame(() => chatInputRef.current?.focus())}
    />
    <Button
      data-testid='chat-message-send-button'
      color='secondary'
      variant='fill'
      Icon={<PFSend width={20} height={20} />}
      size='sm'
      className='text-gray-50'
      onClick={send}
      disabled={!canSend || banned}
    />
  </div>
}
```

- [ ] **Step 2: 검증 + 커밋**

Run: `yarn test:type && yarn lint`
Expected: PASS

```bash
git add src/widgets-mobile/partyroom-chat-panel/partyroom-chat-panel.component.tsx
git commit -m "feat(chat): 모바일 채팅 입력창에 이모지 피커 마운트 (#439)"
```

### Task 8: 전체 회귀 (유닛/타입/린트/빌드)

- [ ] **Step 1: 전체 유닛 테스트**

Run: `yarn test`
Expected: 전체 GREEN (기존 테스트 회귀 0)

- [ ] **Step 2: 타입 + 린트 + 프로덕션 빌드**

Run: `yarn test:type && yarn lint && yarn build`
Expected: 전부 PASS. (⚠️ Windows 공백 경로 + Next 이슈 시 `reference_windows_spaced_path_nextjs_dev_workaround` 메모리 참조 — `.next` 삭제 후 재시도)

### Task 9: e2e 시나리오 추가 (e2e-d 확장)

**Files:**

- Modify: `e2e/e2e-d.profile-avatar-reaction-chat.spec.ts` (기존 채팅 검증 직후에 이어붙임)

- [ ] **Step 1: 기존 `waitForChatMessage(page1, chatMessage)` 성공 직후에 이모지 피커 시나리오 추가**

```ts
// ─── User1: 이모지 피커로 채팅 전송 (#439) ──────────────────────────
log('opening emoji picker');
await page1.getByTestId('chat-emoji-trigger').click();
const emojiPanel = page1.getByTestId('chat-emoji-panel');
await expect(emojiPanel).toBeVisible();

// 연속 두 개 선택 — 패널이 유지되는지까지 함께 검증됨
await emojiPanel.getByRole('button', { name: '🔥' }).last().click();
await emojiPanel.getByRole('button', { name: '🎉' }).last().click();
await expect(emojiPanel).toBeVisible();

// ESC로 닫으면 입력창 포커스 복귀 → 바로 Enter 전송
await page1.keyboard.press('Escape');
await expect(emojiPanel).toHaveCount(0);
await page1.keyboard.press('Enter');

log('waiting for emoji chat message');
await waitForChatMessage(page1, '🔥🎉');
log('emoji chat message rendered');

// 재열기 → 최근 사용 줄 반영 (가장 최근 선택이 맨 앞)
await page1.getByTestId('chat-emoji-trigger').click();
const recents = page1.getByTestId('chat-emoji-recents');
await expect(recents).toBeVisible();
await expect(recents.locator('button').first()).toHaveText('🎉');
await page1.keyboard.press('Escape');
```

주의: `.last()`는 recents 줄에 같은 이모지가 이미 올라온 경우의 strict-mode 충돌 방지(그리드가 항상 마지막). fresh browser context라 최초 recents는 빈 상태.

- [ ] **Step 2: 커밋**

```bash
git add e2e/e2e-d.profile-avatar-reaction-chat.spec.ts
git commit -m "test(e2e): 이모지 피커 전송·최근 사용 시나리오 — e2e-d 확장 (#439)"
```

### Task 10: 로컬 풀스택 e2e (dev 머지 게이트) + 마무리

- [ ] **Step 1: 로컬 풀스택 기동** — `reference_pfplay_web_local_e2e_run`·`reference_local_docker_compose` 메모리 절차 준수: platform 백엔드 docker compose(`-p pfplay-local --env-file .env.local`) 기동 + web은 `npx next dev`(yarn dev 금지). 백엔드 이미지가 스테일이면 `./gradlew :app:bootJar` 선행(`reference_local_docker_boot_stale_host_jar`).

- [ ] **Step 2: e2e-d 실행**

Run: `E2E_BASE_URL=http://localhost:3000 yarn test:e2e e2e/e2e-d.profile-avatar-reaction-chat.spec.ts` (환경변수 주입 방식은 기존 e2e 절차 메모리 준수)
Expected: PASS. cold-start flake면 warm 재실행 1회.

- [ ] **Step 3: 수동 스모크 (권장)** — 데스크탑 뷰포트에서 피커 열기/선택/전송/수신 렌더 + 모바일 뷰포트(360px)에서 패널이 뷰포트 안에 앵커되는지 확인.

- [ ] **Step 4: 커밋 정리 + push** — 사용자 룰(푸시 전 논리단위 통합): Task별 커밋이 이미 논리단위이므로 과분할된 것만 정리(예: i18n·아이콘을 컴포넌트 커밋에 squash해 3~4개로). 파괴적 rebase 전 사용자 확인.

- [ ] **Step 5: PR 생성 (한글)** — base `development`, 제목 `feat(partyroom): 채팅 이모지셋 — 입력창 이모지 피커 (#439)`. 본문에 스펙 링크·스코프·테스트 증거. 머지는 CI 그린 + 사용자 게이트.
