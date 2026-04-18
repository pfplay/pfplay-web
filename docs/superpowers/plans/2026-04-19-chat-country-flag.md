# Chat Country Flag Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 채팅 메시지에서 닉네임 앞에 국기 SVG를 표시하여 유저의 국가를 시각적으로 보여준다.

**Architecture:** 클라이언트가 `navigator.language`에서 국가 코드를 추출하여 파티룸 입장 시 서버에 전달. 서버는 crew 데이터에 저장하고 다른 유저에게 전파. `country-flag-icons` 패키지의 SVG 파일을 `public/flags/`에 복사하여 `<img>`로 렌더링.

**Tech Stack:** Next.js 14, TypeScript, Vitest, React Testing Library, country-flag-icons (devDependency, SVG 소스), Zustand, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-04-19-chat-country-flag-design.md`

---

## File Structure

| Action | Path                                                                                               | Responsibility                                   |
| ------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Create | `src/shared/lib/functions/detect-country-code.ts`                                                  | navigator.language → ISO country code 추출       |
| Create | `src/shared/lib/functions/detect-country-code.test.ts`                                             | 위 유틸 테스트                                   |
| Create | `src/shared/ui/components/country-flag/country-flag.component.tsx`                                 | 국기 SVG 렌더링 컴포넌트                         |
| Create | `src/shared/ui/components/country-flag/country-flag.component.test.tsx`                            | 위 컴포넌트 테스트                               |
| Create | `src/shared/ui/components/country-flag/index.ts`                                                   | 배럴 export                                      |
| Modify | `src/shared/api/http/types/partyrooms.ts:68-84`                                                    | `PartyroomCrew`에 `countryCode` 추가             |
| Modify | `src/shared/api/http/types/partyrooms.ts:185-187`                                                  | `EnterPayload`에 `countryCode` 추가              |
| Modify | `src/shared/api/websocket/types/partyroom.ts:68-76`                                                | `CrewEnteredEvent.crew`에 `countryCode` 추가     |
| Modify | `src/entities/partyroom-client/lib/subscription-callbacks/use-crew-entered-callback.hook.ts:20-34` | `flattenCrewFromEvent`에 `countryCode` 매핑 추가 |
| Modify | `src/features/partyroom/enter/lib/use-enter-partyroom.ts:58-59`                                    | `enter()` 호출에 `countryCode` 전달              |
| Modify | `src/widgets/partyroom-chat-panel/ui/chat-item.component.tsx:44`                                   | 닉네임 앞에 CountryFlag 추가                     |

---

## Chunk 1: Core Utilities

### Task 1: detectCountryCode utility

**Files:**

- Create: `src/shared/lib/functions/detect-country-code.ts`
- Create: `src/shared/lib/functions/detect-country-code.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/shared/lib/functions/detect-country-code.test.ts
import { detectCountryCode } from './detect-country-code';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('detectCountryCode', () => {
  test('"ko-KR"이면 "KR"을 반환한다', () => {
    vi.stubGlobal('navigator', { language: 'ko-KR' });
    expect(detectCountryCode()).toBe('KR');
  });

  test('"en-US"이면 "US"를 반환한다', () => {
    vi.stubGlobal('navigator', { language: 'en-US' });
    expect(detectCountryCode()).toBe('US');
  });

  test('"ja-JP"이면 "JP"를 반환한다', () => {
    vi.stubGlobal('navigator', { language: 'ja-JP' });
    expect(detectCountryCode()).toBe('JP');
  });

  test('"zh-TW"이면 "TW"를 반환한다', () => {
    vi.stubGlobal('navigator', { language: 'zh-TW' });
    expect(detectCountryCode()).toBe('TW');
  });

  test('국가 코드 없이 언어만 있으면 null을 반환한다 ("ko")', () => {
    vi.stubGlobal('navigator', { language: 'ko' });
    expect(detectCountryCode()).toBeNull();
  });

  test('국가 코드 없이 언어만 있으면 null을 반환한다 ("en")', () => {
    vi.stubGlobal('navigator', { language: 'en' });
    expect(detectCountryCode()).toBeNull();
  });

  test('빈 문자열이면 null을 반환한다', () => {
    vi.stubGlobal('navigator', { language: '' });
    expect(detectCountryCode()).toBeNull();
  });

  test('navigator가 undefined이면 null을 반환한다 (SSR)', () => {
    vi.stubGlobal('navigator', undefined);
    expect(detectCountryCode()).toBeNull();
  });

  test('국가 코드를 대문자로 반환한다', () => {
    vi.stubGlobal('navigator', { language: 'en-gb' });
    expect(detectCountryCode()).toBe('GB');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
yarn vitest run src/shared/lib/functions/detect-country-code.test.ts --reporter=verbose
```

Expected: FAIL — `Cannot find module './detect-country-code'`

- [ ] **Step 3: Write minimal implementation**

```ts
// src/shared/lib/functions/detect-country-code.ts

/**
 * navigator.language에서 ISO 3166-1 alpha-2 국가 코드를 추출한다.
 * 브라우저 환경이 아니거나 추출 불가한 경우 null을 반환한다.
 *
 * @example
 * // navigator.language === "ko-KR"
 * detectCountryCode() // "KR"
 *
 * // navigator.language === "en"
 * detectCountryCode() // null
 */
export function detectCountryCode(): string | null {
  if (typeof navigator === 'undefined' || !navigator?.language) {
    return null;
  }

  const parts = navigator.language.split('-');
  if (parts.length < 2 || !parts[1]) {
    return null;
  }

  return parts[1].toUpperCase();
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
yarn vitest run src/shared/lib/functions/detect-country-code.test.ts --reporter=verbose
```

Expected: All 9 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/functions/detect-country-code.ts src/shared/lib/functions/detect-country-code.test.ts
git commit -m "feat: add detectCountryCode utility for navigator.language parsing"
```

---

### Task 2: CountryFlag component

**Files:**

- Create: `src/shared/ui/components/country-flag/country-flag.component.tsx`
- Create: `src/shared/ui/components/country-flag/country-flag.component.test.tsx`
- Create: `src/shared/ui/components/country-flag/index.ts`

- [ ] **Step 1: Write the failing tests**

```tsx
// src/shared/ui/components/country-flag/country-flag.component.test.tsx
import { render, screen } from '@testing-library/react';
import { CountryFlag } from './country-flag.component';

describe('CountryFlag', () => {
  test('유효한 국가 코드가 주어지면 img 요소를 렌더링한다', () => {
    render(<CountryFlag code='KR' />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
  });

  test('img의 src가 로컬 SVG 경로를 가리킨다', () => {
    render(<CountryFlag code='KR' />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toBe('/flags/KR.svg');
  });

  test('기본 크기는 width 16, height 11 (3:2 비율)이다', () => {
    render(<CountryFlag code='US' />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('width', '16');
    expect(img).toHaveAttribute('height', '11');
  });

  test('size prop으로 크기를 변경할 수 있다', () => {
    render(<CountryFlag code='JP' size={24} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('width', '24');
    expect(img).toHaveAttribute('height', '16');
  });

  test('빈 문자열 코드가 주어지면 아무것도 렌더링하지 않는다', () => {
    const { container } = render(<CountryFlag code='' />);
    expect(container.firstChild).toBeNull();
  });

  test('1글자 코드가 주어지면 아무것도 렌더링하지 않는다', () => {
    const { container } = render(<CountryFlag code='K' />);
    expect(container.firstChild).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
yarn vitest run src/shared/ui/components/country-flag/country-flag.component.test.tsx --reporter=verbose
```

Expected: FAIL — `Cannot find module './country-flag.component'`

- [ ] **Step 3: Copy flag SVGs to public directory**

`country-flag-icons` 패키지의 SVG를 `public/flags/`에 복사하여 외부 CDN 의존 없이 자체 호스팅한다:

```bash
mkdir -p public/flags
cp node_modules/country-flag-icons/flags/3x2/*.svg public/flags/
```

> `.gitignore`에 `public/flags/`를 추가하고, 빌드 시 `postinstall` 스크립트로 자동 복사하는 것을 권장한다. 또는 git에 포함시켜도 된다 (SVG 파일은 가볍다).

- [ ] **Step 4: Install country-flag-icons as devDependency**

```bash
yarn add -D country-flag-icons
```

> SVG 소스로만 사용하므로 devDependency로 충분하다.

- [ ] **Step 5: Write minimal implementation**

```tsx
// src/shared/ui/components/country-flag/country-flag.component.tsx
'use client';

import { type FC, useState } from 'react';

type CountryFlagProps = {
  /** ISO 3166-1 alpha-2 국가 코드 (e.g. "KR") */
  code: string;
  /** 크기 (px), default 16 */
  size?: number;
};

export const CountryFlag: FC<CountryFlagProps> = ({ code, size = 16 }) => {
  const [hasError, setHasError] = useState(false);

  if (!code || code.length !== 2 || hasError) {
    return null;
  }

  const upperCode = code.toUpperCase();
  const height = Math.round(size * (2 / 3));

  return (
    <img
      src={`/flags/${upperCode}.svg`}
      alt={upperCode}
      width={size}
      height={height}
      className='rounded-sm overflow-hidden inline-block'
      onError={() => setHasError(true)}
    />
  );
};
```

> 3:2 비율의 SVG이므로 height를 `size * 2/3`으로 계산하여 비율을 유지한다.

- [ ] **Step 6: Run test to verify it passes**

```bash
yarn vitest run src/shared/ui/components/country-flag/country-flag.component.test.tsx --reporter=verbose
```

Expected: All 6 tests PASS.

- [ ] **Step 7: Create barrel export**

```ts
// src/shared/ui/components/country-flag/index.ts
export { CountryFlag } from './country-flag.component';
```

- [ ] **Step 8: Commit**

```bash
git add src/shared/ui/components/country-flag/ public/flags/ package.json yarn.lock
git commit -m "feat: add CountryFlag component with local SVG flag icons"
```

---

## Chunk 2: Type Changes & Data Flow

### Task 3: Update API types

**Files:**

- Modify: `src/shared/api/http/types/partyrooms.ts:68-84`
- Modify: `src/shared/api/http/types/partyrooms.ts:185-187`
- Modify: `src/shared/api/websocket/types/partyroom.ts:68-76`

- [ ] **Step 1: Add `countryCode` to `PartyroomCrew`**

In `src/shared/api/http/types/partyrooms.ts`, add `countryCode` as the last field of `PartyroomCrew`:

```ts
// After line 83 (scale: number;), add:
  countryCode?: string | null;
```

> `optional`로 선언하여 백엔드 배포 전에도 타입 에러 없이 동작하도록 한다.

- [ ] **Step 2: Add `countryCode` to `EnterPayload`**

In `src/shared/api/http/types/partyrooms.ts`, modify `EnterPayload`:

```ts
export type EnterPayload = {
  partyroomId: number;
  countryCode?: string;
};
```

- [ ] **Step 3: Add `countryCode` to `CrewEnteredEvent`**

In `src/shared/api/websocket/types/partyroom.ts`, add to `CrewEnteredEvent.crew`:

```ts
// After line 75 (avatar: CrewAvatar;), add:
    countryCode?: string | null;
```

- [ ] **Step 4: Run type check**

```bash
yarn tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Run all tests to verify nothing breaks**

```bash
yarn vitest run --reporter=verbose 2>&1 | tail -10
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/shared/api/http/types/partyrooms.ts src/shared/api/websocket/types/partyroom.ts
git commit -m "feat: add countryCode field to PartyroomCrew, EnterPayload, and CrewEnteredEvent types"
```

---

### Task 4: Update flattenCrewFromEvent mapping

**Files:**

- Modify: `src/entities/partyroom-client/lib/subscription-callbacks/use-crew-entered-callback.hook.ts:20-34`
- Modify: `src/entities/partyroom-client/lib/subscription-callbacks/use-crew-entered-callback.hook.test.ts`

- [ ] **Step 1: Update test factory and write the failing tests**

First, update the `createCrewEnteredEvent` factory in `use-crew-entered-callback.hook.test.ts` to accept an optional `countryCode` parameter:

```ts
// Replace the existing createCrewEnteredEvent (lines 37-58):
const createCrewEnteredEvent = (
  crewId: number,
  nickname = '새유저',
  countryCode?: string | null
): CrewEnteredEvent => ({
  partyroomId: 1,
  id: crypto.randomUUID(),
  timestamp: Date.now(),
  eventType: PartyroomEventType.CREW_ENTERED,
  crew: {
    crewId,
    gradeType: GradeType.CLUBBER,
    nickname,
    avatar: {
      avatarCompositionType: AvatarCompositionType.NONE,
      avatarBodyUri: 'body.png',
      avatarFaceUri: null,
      avatarIconUri: 'icon.png',
      combinePositionX: 0,
      combinePositionY: 0,
      offsetX: 0,
      offsetY: 0,
      scale: 1,
    },
    countryCode,
  },
});
```

Then add new tests **inside** the `describe` block (before the closing `});` on line 126):

```ts
test('입장한 크루의 countryCode가 매핑된다', () => {
  const { result } = renderHook(() => useCrewEnteredCallback());
  const callback = result.current;

  callback(createCrewEnteredEvent(1, '한국유저', 'KR'));

  const crew = store.getState().crews[0];
  expect(crew.countryCode).toBe('KR');
});

test('countryCode가 없는 크루는 countryCode가 undefined이다', () => {
  const { result } = renderHook(() => useCrewEnteredCallback());
  const callback = result.current;

  callback(createCrewEnteredEvent(1));

  const crew = store.getState().crews[0];
  expect(crew.countryCode).toBeUndefined();
});
```

- [ ] **Step 2: Run test to verify the first new test fails**

```bash
yarn vitest run src/entities/partyroom-client/lib/subscription-callbacks/use-crew-entered-callback.hook.test.ts --reporter=verbose
```

Expected: `입장한 크루의 countryCode가 매핑된다` FAILS (countryCode not mapped).

- [ ] **Step 3: Update flattenCrewFromEvent**

In `src/entities/partyroom-client/lib/subscription-callbacks/use-crew-entered-callback.hook.ts`, add `countryCode` to the return object of `flattenCrewFromEvent`:

```ts
function flattenCrewFromEvent(eventCrew: CrewEnteredEvent['crew']): PartyroomCrew {
  return {
    crewId: eventCrew.crewId,
    gradeType: eventCrew.gradeType,
    nickname: eventCrew.nickname,
    avatarCompositionType: eventCrew.avatar.avatarCompositionType,
    avatarBodyUri: eventCrew.avatar.avatarBodyUri,
    avatarFaceUri: eventCrew.avatar.avatarFaceUri ?? '',
    avatarIconUri: eventCrew.avatar.avatarIconUri,
    combinePositionX: eventCrew.avatar.combinePositionX,
    combinePositionY: eventCrew.avatar.combinePositionY,
    offsetX: eventCrew.avatar.offsetX,
    offsetY: eventCrew.avatar.offsetY,
    scale: eventCrew.avatar.scale,
    countryCode: eventCrew.countryCode,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
yarn vitest run src/entities/partyroom-client/lib/subscription-callbacks/use-crew-entered-callback.hook.test.ts --reporter=verbose
```

Expected: All tests PASS (including the 2 new ones).

- [ ] **Step 5: Commit**

```bash
git add src/entities/partyroom-client/lib/subscription-callbacks/use-crew-entered-callback.hook.ts src/entities/partyroom-client/lib/subscription-callbacks/use-crew-entered-callback.hook.test.ts
git commit -m "feat: map countryCode in flattenCrewFromEvent for crew entered events"
```

---

### Task 5: Pass countryCode on partyroom enter

**Files:**

- Modify: `src/features/partyroom/enter/lib/use-enter-partyroom.ts:1-2,58-59`

- [ ] **Step 1: Add detectCountryCode import and pass to enter()**

In `src/features/partyroom/enter/lib/use-enter-partyroom.ts`:

Add import at the top:

```ts
import { detectCountryCode } from '@/shared/lib/functions/detect-country-code';
```

Change the `enter()` call (line 58-59) from:

```ts
        enter(
          { partyroomId },
```

To:

```ts
        enter(
          { partyroomId, countryCode: detectCountryCode() ?? undefined },
```

- [ ] **Step 2: Run type check**

```bash
yarn tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/partyroom/enter/lib/use-enter-partyroom.ts
git commit -m "feat: send countryCode on partyroom enter"
```

---

## Chunk 3: Chat UI Integration

### Task 6: Add CountryFlag to chat-item

**Files:**

- Modify: `src/widgets/partyroom-chat-panel/ui/chat-item.component.tsx:1,44`
- Create: `src/widgets/partyroom-chat-panel/ui/chat-item.component.test.tsx`

- [ ] **Step 1: Write chat-item integration tests**

```tsx
// src/widgets/partyroom-chat-panel/ui/chat-item.component.test.tsx
import { render, screen } from '@testing-library/react';
import type { ChatMessage } from '@/entities/current-partyroom';
import { AvatarCompositionType, GradeType } from '@/shared/api/http/types/@enums';
import ChatItem from './chat-item.component';

const createUserChat = (overrides: Partial<ChatMessage.UserChat> = {}): ChatMessage.UserChat => ({
  from: 'user',
  crew: {
    crewId: 1,
    nickname: '테스트유저',
    gradeType: GradeType.LISTENER,
    avatarCompositionType: AvatarCompositionType.NONE,
    avatarBodyUri: 'body.png',
    avatarFaceUri: '',
    avatarIconUri: 'icon.png',
    combinePositionX: 0,
    combinePositionY: 0,
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    ...overrides.crew,
  },
  message: { messageId: '1', content: '안녕하세요', ...overrides.message },
  receivedAt: Date.now(),
  ...overrides,
});

describe('ChatItem', () => {
  test('countryCode가 있으면 국기 이미지가 렌더링된다', () => {
    const message = createUserChat({ crew: { countryCode: 'KR' } as any });
    render(<ChatItem message={message} />);
    const flagImg = screen.getByAltText('KR');
    expect(flagImg).toBeInTheDocument();
    expect(flagImg.getAttribute('src')).toBe('/flags/KR.svg');
  });

  test('countryCode가 없으면 국기 이미지가 렌더링되지 않는다', () => {
    const message = createUserChat();
    render(<ChatItem message={message} />);
    const flagImgs = screen
      .queryAllByRole('img')
      .filter((img) => img.getAttribute('src')?.startsWith('/flags/'));
    expect(flagImgs).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
yarn vitest run src/widgets/partyroom-chat-panel/ui/chat-item.component.test.tsx --reporter=verbose
```

Expected: FAIL — CountryFlag not yet rendered in chat-item.

- [ ] **Step 3: Add CountryFlag import**

In `src/widgets/partyroom-chat-panel/ui/chat-item.component.tsx`, add import:

```ts
import { CountryFlag } from '@/shared/ui/components/country-flag';
```

- [ ] **Step 4: Update nickname rendering**

Change line 44 from:

```tsx
<Typography type='detail2'>{crew.nickname}</Typography>
```

To:

```tsx
<div className='flex items-center gap-1'>
  {crew.countryCode && <CountryFlag code={crew.countryCode} />}
  <Typography type='detail2'>{crew.nickname}</Typography>
</div>
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
yarn vitest run src/widgets/partyroom-chat-panel/ui/chat-item.component.test.tsx --reporter=verbose
```

Expected: All tests PASS.

- [ ] **Step 6: Run type check**

```bash
yarn tsc --noEmit
```

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add src/widgets/partyroom-chat-panel/ui/chat-item.component.tsx src/widgets/partyroom-chat-panel/ui/chat-item.component.test.tsx
git commit -m "feat: display country flag next to nickname in chat messages"
```

---

### Task 7: Final verification

- [ ] **Step 1: Run full type check**

```bash
yarn tsc --noEmit
```

Expected: No errors.

- [ ] **Step 2: Run full test suite**

```bash
yarn vitest run
```

Expected: All tests pass.

- [ ] **Step 3: Verify build**

```bash
yarn build
```

Expected: Build succeeds with no errors.
