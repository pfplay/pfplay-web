# 시스템 공지사항 및 점검 페이지 설계

## 목표

서비스 운영 중 시스템 점검 등 전체 유저에게 알려야 하는 공지를 실시간으로 전달하고, 점검 상태 진입 시 서비스 이용을 차단하는 점검 페이지로 전환한다.

## 기존 파티룸 공지와의 차이

| 구분        | 파티룸 공지           | 시스템 공지                  |
| ----------- | --------------------- | ---------------------------- |
| 범위        | 특정 파티룸 내        | 서비스 전체                  |
| 표시 방식   | 마키(스크롤 텍스트)   | 모달 다이얼로그              |
| 수신 채널   | 파티룸 구독 WebSocket | 글로벌 WebSocket (별도 토픽) |
| 위치 의존성 | 해당 파티룸 안에서만  | 어디에 있든 표시             |

## 기능 구성

### 1. 점검 예고 — 시스템 공지 모달

**수신 방식:** 백엔드 WebSocket 실시간 푸시

**페이로드:**

```ts
type SystemAnnouncementEvent = {
  id: string;
  type: 'MAINTENANCE'; // 향후 확장 가능 (e.g. 'UPDATE', 'EVENT')
  title: string;
  content: string;
  scheduledAt?: number; // UTC timestamp, 점검 시작 시각 (선택)
};
```

**표시 방식:**

- 어떤 페이지에 있든 모달 다이얼로그로 표시
- root layout 레벨에 배치하여 전역 동작
- 확인 버튼으로 닫기
- 같은 `id`의 공지는 중복 표시하지 않음 (세션 내 dismissed ID 관리)

**모달 내용:**

- 제목 (title)
- 본문 (content)
- 점검 시작 시각 표시 (scheduledAt이 있을 경우)
- 확인 버튼

### 2. 점검 중 페이지

**경로:** `/maintenance`

**진입 조건:** HTTP 응답 인터셉터에서 503 상태 코드 감지 시 `/maintenance`로 리다이렉트. 단, 현재 경로가 이미 `/maintenance`인 경우 리다이렉트하지 않음 (무한 루프 방지).

**페이지 내용:**

- 점검 중임을 알리는 안내 문구
- 점검 완료 후 새로고침 유도 메시지

**복귀:** 유저가 직접 새로고침. 서버가 정상 응답하면 기존 페이지로 돌아감.

## 아키텍처

### WebSocket 이벤트 흐름

```
관리자 → 백엔드 공지 등록 → WebSocket 푸시 (글로벌 토픽)
  → 프론트 수신 → dismissed 여부 확인 → 모달 표시
```

### 503 리다이렉트 흐름

```
서버 점검 돌입 → API 503 응답
  → HTTP 인터셉터 감지 → /maintenance 리다이렉트
```

### 컴포넌트 구조

```
src/app/layout.tsx
  └─ <SystemAnnouncementModal />   ← 전역 모달 (Client Component, 신규)

src/app/maintenance/
  ├─ layout.tsx                    ← 독립 레이아웃 (Provider 불필요)
  └─ page.tsx                      ← 점검 안내 페이지

src/shared/api/http/client/interceptors/response.ts
  └─ 503 감지 → /maintenance 리다이렉트 (수정)
```

### WebSocket 구독

시스템 공지는 파티룸 구독과 독립적이다. 유저가 로그인한 시점에 글로벌 토픽을 구독하며, 파티룸 입장 여부와 무관하게 수신한다.

구체적인 WebSocket 토픽 경로와 구독 시점은 백엔드와 협의하여 결정한다. 게스트 포함 모든 유저가 JWT 인증 및 WebSocket 연결을 가지므로, 모든 접속 유저가 시스템 공지를 수신할 수 있다.

## 파일 구조

```
src/
  features/system-announcement/
    model/
      system-announcement.store.ts   ← dismissed ID 관리 (세션 스토리지 or 메모리)
    ui/
      system-announcement-modal.tsx  ← 모달 컴포넌트
    index.ts

  app/maintenance/
    layout.tsx
    page.tsx

  shared/api/http/client/interceptors/
    response.ts                      ← 503 핸들링 추가
```

## 백엔드 요구사항

1. **시스템 공지 WebSocket 이벤트**: 글로벌 토픽으로 `SystemAnnouncementEvent` 푸시
2. **503 응답**: 점검 상태에서 모든 API에 503 Service Unavailable 반환

## UI 디자인

### 점검 예고 모달

기존 `Dialog` 컴포넌트 스타일을 그대로 따른다:

- Dialog.Panel: `w-[440px]`, `bg-gray-800`, `border-gray-700`, `rounded-[6px]`, `pt-[52px] px-[32px] pb-[32px]`
- Title: `body1` (20px bold), `text-gray-50`, center 정렬
- Sub (본문): `detail1` (16px normal), `text-gray-300`
- 점검 시각 박스: 레드 틴트 배경 (`rgba(243,31,44,0.06)`), 레드 보더 (`rgba(243,31,44,0.2)`), 시각 강조 `text-red-200` (`#FF5B65`)
- Button: `Dialog.Button` size `xl` (56px), primary fill (`bg-gradient-red`), `rounded-[4px]`
- ButtonGroup: `mt-[36px]`, `gap-[8px]`, `flex w-full`

### 점검 중 페이지 (/maintenance)

독립 레이아웃, 전체 화면 중앙 정렬:

- 배경: `bg-black`
- 아이콘: 레드 그라디언트 원형 (80px)
- 제목: `title1` (28px bold), `text-gray-50`
- 본문: `detail1` (16px normal), `text-gray-400`
- 점검 시간 정보 박스: `bg-gray-800`, `border-gray-700`, `rounded-[6px]`
- 시간 값: `text-red-200` (`#FF5B65`), bold
- 새로고침 링크: `text-red-300` (`#F31F2C`), underline
- 하단 로고: `text-gray-700`

## 범위 외 (YAGNI)

- 점검 종료 자동 감지 및 자동 복귀
- 공지 히스토리/목록 조회
- 공지 유형 분류 (점검/업데이트/이벤트 등)
- 관리자 공지 작성 UI
