# Chat Country Flag Display — Design Spec

## Goal

채팅 메시지에서 닉네임 앞에 국기를 표시하여 유저의 국가를 시각적으로 보여준다.

## Architecture

클라이언트가 `navigator.language`에서 국가 코드를 추출하고, 파티룸 입장 시 서버에 전달한다. 서버는 crew 데이터에 `countryCode`를 포함하여 저장하고, 다른 유저들이 채팅 메시지를 수신할 때 crew 조회를 통해 국가 코드를 함께 받는다. 클라이언트는 `country-flag-icons` 패키지의 SVG 국기 이미지를 닉네임 앞에 16px 크기로 렌더링한다.

## Decisions

| 항목        | 결정                               | 이유                                   |
| ----------- | ---------------------------------- | -------------------------------------- |
| 국가 감지   | `navigator.language` (client-side) | 가장 간단, 별도 서비스 불필요          |
| 국기 렌더링 | `country-flag-icons` SVG           | Windows에서 국기 이모지 미지원         |
| 국기 위치   | 닉네임 앞                          | 가장 자연스럽고 일반적인 패턴          |
| 국기 크기   | 16px (w-4 h-4)                     | 닉네임 텍스트(`detail2`)와 시각적 균형 |
| fallback    | 국가 코드 없으면 국기 미표시       | 기존 UI와 동일하게 유지                |

---

## 1. 국가 코드 감지 유틸리티

**파일**: `src/shared/lib/functions/detect-country-code.ts`

`navigator.language`에서 ISO 3166-1 alpha-2 국가 코드를 추출한다.

### 로직

1. `navigator.language` 값을 읽는다 (예: `"ko-KR"`, `"en-US"`, `"ja"`)
2. `-` 구분자가 있으면 뒤쪽 부분을 국가 코드로 사용 (`"ko-KR"` → `"KR"`)
3. 구분자가 없으면 언어 코드로 fallback 매핑:
   - `ko` → `KR`, `ja` → `JP`, `zh` → `CN`, `en` → `US`, `de` → `DE`, `fr` → `FR`, `es` → `ES`, `pt` → `BR`, `it` → `IT`, `ru` → `RU`
4. 매핑 불가하면 `null` 반환

### 인터페이스

```ts
/**
 * navigator.language에서 ISO 3166-1 alpha-2 국가 코드를 추출한다.
 * 브라우저 환경이 아니거나 추출 불가한 경우 null을 반환한다.
 */
export function detectCountryCode(): string | null;
```

---

## 2. CountryFlag 컴포넌트

**파일**: `src/shared/ui/components/country-flag/country-flag.component.tsx`
**배럴**: `src/shared/ui/components/country-flag/index.ts`

`country-flag-icons` 패키지의 SVG를 사용하여 국기를 렌더링한다.

### 인터페이스

```tsx
type CountryFlagProps = {
  code: string; // ISO 3166-1 alpha-2 (e.g. "KR")
  size?: number; // px, default 16
};

export const CountryFlag: FC<CountryFlagProps>;
```

### 동작

- `country-flag-icons/react/3x2` 에서 해당 국가의 SVG 컴포넌트를 렌더링
- 유효하지 않은 코드인 경우 `null` 반환 (아무것도 렌더링하지 않음)
- `rounded-sm` 클래스로 약간의 둥근 모서리 적용

---

## 3. 백엔드 API 변경 스펙

### 3.1 PartyroomCrew 타입에 필드 추가

```ts
export type PartyroomCrew = {
  // ...기존 필드 전부 유지
  countryCode: string | null; // ISO 3166-1 alpha-2 (e.g. "KR"), nullable
};
```

### 3.2 파티룸 입장 API

`EnterPayload`에 `countryCode` 필드를 추가한다:

```ts
export type EnterPayload = {
  partyroomId: number;
  countryCode?: string; // ISO 3166-1 alpha-2, optional
};
```

서버는 이 값을 crew 데이터에 저장한다. 값이 없으면 `null`로 저장한다.

### 3.3 영향받는 응답/이벤트

- `GetSetUpInfoResponse.crews[]` — 각 crew에 `countryCode` 포함
- `CrewEnteredEvent.crew` — `countryCode` 필드 추가
- `ChatMessageSentEvent` — 변경 없음 (crew store에서 조회하므로)

### 3.4 WebSocket 이벤트 타입 변경

```ts
// CrewEnteredEvent.crew에 countryCode 추가
export type CrewEnteredEvent = WebSocketEventBase & {
  eventType: PartyroomEventType.CREW_ENTERED;
  crew: {
    crewId: number;
    gradeType: GradeType;
    nickname: string;
    avatar: CrewAvatar;
    countryCode: string | null; // 추가
  };
};
```

---

## 4. 프론트엔드 데이터 흐름

```
[입장 시]
navigator.language → detectCountryCode() → "KR"
→ enter({ partyroomId, countryCode: "KR" })
→ 서버가 crew에 countryCode 저장

[초기 로드]
getSetupInfo() → crews[].countryCode → Zustand store에 저장

[다른 유저 입장]
CrewEnteredEvent → crew.countryCode → Zustand store에 추가

[채팅 수신]
ChatMessageSentEvent → crewId로 store 조회 → crew.countryCode 획득
→ chat-item에서 CountryFlag 렌더링
```

---

## 5. 채팅 UI 변경

**파일**: `src/widgets/partyroom-chat-panel/ui/chat-item.component.tsx`

닉네임 앞에 CountryFlag 컴포넌트를 추가한다.

### 변경 전

```tsx
<Typography type='detail2'>{crew.nickname}</Typography>
```

### 변경 후

```tsx
<div className='flex items-center gap-1'>
  {crew.countryCode && <CountryFlag code={crew.countryCode} />}
  <Typography type='detail2'>{crew.nickname}</Typography>
</div>
```

### 시각적 결과

```
[아바타 32px]   🇰🇷 닉네임
[등급 라벨]     메시지 버블
```

국가 코드가 없는 유저는 기존과 동일하게 닉네임만 표시된다.

---

## 6. 테스트 전략

### 유닛 테스트

- `detectCountryCode()`: language → 국가 코드 매핑 정상 동작, fallback 매핑, null 반환 케이스
- `CountryFlag`: code prop에 따른 렌더링, 유효하지 않은 코드 시 null 렌더링
- `chat-item`: countryCode가 있을 때 국기 표시, 없을 때 미표시

### 변경되는 타입

- `PartyroomCrew` — `countryCode` 필드 추가
- `EnterPayload` — `countryCode` 필드 추가
- `CrewEnteredEvent` — `crew.countryCode` 필드 추가

---

## 7. 의존성

### 새로운 패키지

- `country-flag-icons` — SVG 국기 아이콘 (경량, 트리쉐이킹 지원)

---

## 8. 범위 밖 (Out of Scope)

- IP 기반 GeoIP 감지
- 국가 변경 UI
- 유저 프로필에 국가 표시
- 국기 클릭 시 인터랙션
