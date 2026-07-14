# 채팅 이모지셋 — 설계 (#439)

## 배경

2026-07 기능 로드맵 엔지니어링 트랙 #1 (퀵윈). 파티룸 채팅에 이모지 입력 수단이 없어, 데스크탑 사용자는 OS 이모지 입력기를 알아야만 이모지를 쓸 수 있다. 채팅 생동감(방 분위기) 축의 첫 단계로, 입력창에서 바로 고를 수 있는 큐레이션 이모지 피커를 제공한다.

**현재 채팅 구조 (탐색 확인)**: 채팅은 STOMP `/pub/groups/{roomId}/send`에 `{ content }` 순수 텍스트로 발행 → Redis pub/sub 브로드캐스트 → `chat-item`이 raw string으로 렌더. DB 미저장·백엔드 검증 없음. 유니코드 이모지는 이미 경로 전체를 그대로 통과·렌더된다(폰트 폴백에 `Apple Color Emoji`/`Segoe UI Emoji` 기존재). **따라서 본 작업은 pfplay-web 단독, 백엔드 무변경.**

## 사용자 확정 스코프 (2026-07-11)

1. **큐레이션 유니코드 셋** — 외부 이모지 라이브러리(emoji-mart 등) 미사용. 40개 고정 상수.
2. **데스크탑/모바일 양쪽 제공** — 동일 팝오버 컴포넌트 공용(접근 A). 모바일 보텀시트 승격은 필요 시 후속.
3. **최근 사용 줄 V1 포함** — localStorage MRU 최대 8개.
4. 파킹 없이 이번 세션에서 구현·테스트까지 완주.

## 목표 / 성공 기준

- 데스크탑·모바일 채팅 입력창에서 이모지 버튼 → 피커 → 선택 → 메시지에 삽입 → 전송까지 마우스/터치만으로 가능.
- 선택한 이모지가 상대 화면(수신 측)에서 정상 렌더.
- 채팅밴 중에는 피커도 함께 비활성.
- 기존 채팅 입력 동작(Enter 전송, IME composition, 밴 툴팁) 회귀 0.

## 비목표 (YAGNI)

- 커스텀 이미지 이모트(:code: 파싱), 메시지 리액션, 이모지 검색/카테고리 탭, 스킨톤 변형 선택 — 전부 제외.
- 커서 위치 삽입(caret-aware insert) — V1은 끝에 append (채팅은 단문).
- 백엔드 변경(길이 제한·검증 추가) 없음 — 기존에도 없던 것을 이번에 새로 만들지 않는다.
- 데스크탑/모바일 채팅 패널의 중복 정리(useTempChatBanTimer 등 기존 FIXME) — 별도 작업.

## 설계

### ① 컴포넌트 구조 (FSD)

```
src/features/partyroom/send-chat-message/
  ui/chat-emoji-picker.component.tsx   ← 신규: 트리거 버튼 + Popover 패널 일체
  lib/emoji-set.ts                     ← 신규: CHAT_EMOJIS 상수 (40개)
  lib/use-recent-emojis.hook.ts        ← 신규: localStorage MRU 훅
  index.ts                             ← ChatEmojiPicker export 추가
```

- `ChatEmojiPicker`는 **Headless UI v2 `Popover`** 기반. props: `{ onSelect: (emoji: string) => void; disabled?: boolean }`.
- 트리거: 신규 SVG 아이콘 `public/icons/Chat/icn_emoji.svg`(스마일 얼굴) → `yarn svgr`로 `PFEmoji` 생성. 기존 전송 버튼과 동일한 `Button` 스타일 문법(`size='sm'`, ghost 계열)으로 통일.
- 패널: Headless UI v2 `anchor`(floating) 사용, 입력창 위로 뜨는 그리드. `grid-cols-8` 내외, 최대 높이 + 세로 스크롤. 파티룸 다크 톤(gray-800~900 배경, border-gray-700)으로 기존 `menu-item-panel` 룩과 정합.
- **마운트 지점 2곳** (패널이 각자 Input을 소유하므로):
  - 데스크탑 `widgets/partyroom-chat-panel/ui/partyroom-chat-panel.component.tsx` — `Input`의 `Suffix`를 `flex items-center gap-1` 래퍼로 바꾸고 `[이모지 버튼][전송 버튼]` 배치.
  - 모바일 `widgets-mobile/partyroom-chat-panel/partyroom-chat-panel.component.tsx` — 동일 패턴.
- `Input` 래퍼의 click-to-focus는 `closest('button')` 가드가 있어 이모지 버튼 클릭과 충돌 없음(확인).

### ② 이모지 셋 (40개 확정)

음악/파티/리액션 위주. **전부 Emoji 11.0(2018) 이하** — Windows 10(Segoe UI Emoji)·구형 모바일에서 두부(□) 없음. Emoji 12+(🥹🫶🪩🫠 등)는 의도적으로 제외.

```
🎧 🎵 🎶 🎤 🎹 🥁 🎸 🎷 📀 🔥
✨ 🎉 💃 🕺 👏 🙌 🤘 🤙 💪 ❤️
💜 😍 🤩 😎 🥳 😊 😆 😂 🤣 😭
😅 😮 🤔 😴 👍 👎 🙏 💯 🍻 🥂
```

- `emoji-set.ts`에 `as const` 배열로 고정. 유닛 테스트로 개수(40)·중복 없음을 단언.

### ③ 삽입 동작

- 선택 시 `onSelect(emoji)` → 패널 마운트 측에서 `setMessage(message + emoji)` (render-prop의 현재 `message` 기준 append) → **입력창 포커스 복귀**(패널에서 `inputRef`를 만들어 `Input`에 전달, select 후 `.focus()`).
- **팝오버는 선택 후에도 유지** — 연속 입력 가능. Headless UI Popover 기본 동작(패널 내부 클릭은 안 닫힘, 외부 클릭/ESC 닫힘)이 그대로 부합. 단, 선택 버튼이 form submit을 유발하지 않도록 `type='button'` 보장.
- IME: append는 controlled state 경유라 composition 로직(`isComposing` Enter 가드)과 무간섭.
- 채팅밴: `disabled` prop으로 트리거 비활성(기존 `banned` 상태 재사용). 열려 있는 중 밴 되는 엣지는 전송 버튼과 동일하게 send 차단에 맡긴다.

### ④ 최근 사용 (recents)

- `use-recent-emojis.hook.ts`: `{ recents: string[], addRecent: (emoji: string) => void }`.
- localStorage key `pfplay:chat:recent-emojis`, JSON string 배열. MRU: 선택 시 맨 앞 삽입 + 중복 제거 + **최대 8개** 절삭.
- SSR/hydration 안전: 초기 state는 `[]`, 마운트 후(`useEffect`) 로드. localStorage 접근은 try/catch — 실패(프라이빗 모드 등) 시 recents 없이 동작.
- 피커 최상단에 "최근 사용" 라벨 + 한 줄(비어 있으면 섹션 자체 숨김) + 구분선 + 전체 그리드.

### ⑤ i18n / 접근성

- `ko.json`/`en.json`의 `chat` 키 아래 직접 추가(`yarn i18n` 실행 금지 룰):
  - 트리거 `aria-label`: ko `이모지 선택` / en `Choose emoji`
  - recents 라벨: ko `최근 사용` / en `Recently used`
- 각 이모지 버튼은 이모지 문자 자체가 접근 가능한 이름(추가 label 불요), 트리거만 aria-label.

## 데이터 흐름 / 백엔드

변경 없음. 이모지는 유니코드 문자열로 `client.sendChatMessage(content)` → STOMP → `PartyroomChatCommandService`(검증 없음, Redis 발행) → 브로드캐스트 → `chat-item` raw 렌더. JSON/Redis 직렬화는 평문 유니코드라 무손실.

## 테스트

- **유닛 (vitest)**: `use-recent-emojis` — MRU 순서·중복 제거·8개 절삭·localStorage 예외 내성·마운트 후 로드. `emoji-set` — 40개·중복 없음.
- **컴포넌트 (vitest + testing-library)**: `ChatEmojiPicker` — 트리거 클릭으로 패널 열림, 이모지 클릭 시 `onSelect` 호출·패널 유지, `disabled` 시 열리지 않음, recents 비어 있으면 섹션 미표시.
- **로컬 풀스택 e2e 스모크 (머지 게이트)**: 파티룸 입장 → 피커 열기 → 이모지 2개 선택 → 전송 → 채팅 목록에 이모지 렌더 확인 + 재열기 시 recents 반영. 데스크탑 뷰포트 기준 1시나리오(모바일은 동일 컴포넌트라 컴포넌트 테스트로 갈음).
- 기존 채팅 e2e/유닛 회귀 그린.

## 산출물 / 절차

- 이슈: pfplay-web **#439**. 브랜치: `feat/chat-emoji-set-439` (origin/development 분기).
- 커밋·PR 한글, dev 머지 전 로컬 풀스택 + e2e (사용자 룰).
