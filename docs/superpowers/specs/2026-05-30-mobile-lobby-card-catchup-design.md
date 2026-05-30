# 모바일 lobby 카드 데스크탑 catch-up (chunk 5) — Design

- **Issue**: TBD (spec 승인 후 등록)
- **Date**: 2026-05-30
- **Branch**: `feature/mobile-responsive-chunk5`
- **시리즈**: 모바일 반응형 chunk 1~4 + #372 (env zod) 완료, chunk 5 진입
- **관련 메모리**: `project_mobile_chunk5_next_session_entry`, `project_mobile_lobby_card_chunk5_backlog`, `project_mobile_responsive_scope_340.md`

## 1. 배경 (Why)

chunk 2 에서 진입한 모바일 lobby 1컬럼 카드는 의도된 **v1 minimal** 이었다. 데스크탑 `PartyroomCard` 의 BackdropBlur·Crews 아바타·Typography 토큰·PFInfoOutline 4 가지 시각 자산이 모두 빠져 있다. chunk 5 는 그 격차를 좁힌다.

chunk 5 의 **1차 목적은 전환 깔때기 강화**다. 모바일 반응형 전환의 1차 목표가 "공유 링크 / 소셜 유입자의 입장 전환율 증가" (이슈 #340 framing) 이므로, lobby 첫 화면의 카드가 "지금 사람들이 모여서 듣고 있는 활성 파티" 분위기를 빠르게 전달하는 것이 활성화 신호로 가장 강력하다. 시각적 일관성 (데스크탑↔모바일 디자인 시스템 통일) 은 부수 효과로 따라온다.

### 현재 격차 (v1 vs 데스크탑 baseline)

| 항목          | 데스크탑 baseline                                                                                             | 현재 모바일 v1                                                              | 데이터/컴포넌트 가용                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 카드 구조     | `BackdropBlurContainer` (썸네일 cover scale-105 + `backdrop-blur-sm bg-backdrop-black/80` 오버레이) 단일 카드 | 평면 `bg-gray-900` + 상단 `aspect-video` 썸네일 슬롯 + 하단 정보 블록 (2단) | shared 재사용 가능                                                  |
| 아바타        | `Crews` (`PFPersonFilled` + count + 아바타 최대 3개)                                                          | `👥` emoji + 카운트만                                                       | `primaryIcons` API 응답 포함, mock 에도 존재하나 컴포넌트가 무시 중 |
| Typography    | `type='title2'` / `caption1` / `body3` 디자인 토큰                                                            | raw `<h3>`, raw `<p>`                                                       | shared 재사용 가능                                                  |
| PFInfoOutline | 우하단 24×24 (정적 아이콘, `role='presentation'`)                                                             | 없음                                                                        | shared icon                                                         |

## 2. 목표 (What)

1. `MobilePartyroomCard` 를 **BackdropBlur 단일 카드** 패턴으로 rewrite — 데스크탑 `PartyroomCard` 와 동일 패밀리
2. shared 컴포넌트 (`BackdropBlurContainer`, `Typography`, `Crews`) 차용. 모바일 폼팩터 specific 한 spacing/sizing 만 `MobilePartyroomCard` 가 자체 결정
3. Main 카드 (현재 일반 카드 디자인으로 prepend) 에 "PFPlay Main Stage" 라벨만 추가하여 공식 룸 정체성 전달
4. 기존 단위 test 업데이트 + 신규 케이스 (아바타 렌더·Main 라벨 분기)

비목표 (out of scope):

- 데스크탑 `PartyroomCard` / `MainPartyroomCard` 수정 (무영향)
- `PFInfoOutline` 모바일 포함 — 깔때기 lens 에서 정보 기능 부재로 redundant (의도적 제외, §3.4)
- `Crews` 컴포넌트를 `features/` → `shared/` hoist — chunk 5 스코프 초과, YAGNI
- 모바일 hero 카드 별도 디자인 (`MobileMainPartyroomCard` 신규) — 1컬럼 리듬 깨짐, YAGNI
- 다른 모바일 화면 (헤더·플레이리스트·displayBoard 등) 의 시각 자산
- Main 라벨의 다국어 추가 키 — 기존 `t.lobby.para.pfplay_main_stage` 재사용

## 3. 결정 잠금 (clarifying questions 결과)

| #   | 결정           | 답                                                            | 근거                                                                              |
| --- | -------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Q1  | 1차 목적       | 전환 깔때기 강화                                              | 이슈 #340 모바일 반응형 1차 목표 정합                                             |
| Q2  | 카드 구조      | A. BackdropBlur 단일 카드 (데스크탑 패턴 모바일 폼팩터 축소)  | 분위기 신호 가장 강함 + 데스크탑 검증된 가독성 패턴                               |
| Q3  | Main 카드 처리 | a. 일반 카드 + Main 라벨 추가                                 | 1컬럼 리듬 유지 + 공식 룸 정체성 전달 + 코드 재사용                               |
| Q4  | PFInfoOutline  | 제외                                                          | 정적 아이콘 (정보 기능 없음) + 좁은 카드 시각 노이즈 + 깔때기 lens 에서 가치 약함 |
| Q5  | 스코프         | `MobilePartyroomCard` 1개 파일                                | `MobilePartyroomList` 외 다른 사용처 없음 (grep 확인)                             |
| Q6  | 구현 접근      | A2. `MobilePartyroomCard` 를 shared 컴포넌트 차용해서 rewrite | `features-mobile` ↔ `features` 분리 유지, 변경 격리                              |

### 3.1 카드 구조 A 선택 — trade-off 정리

- ✅ 활성 파티 분위기 신호 가장 강함 (목적 정합)
- ✅ 데스크탑과 디자인 시스템 통일
- ⚠️ 어두운 썸네일에서 텍스트 가독성 우려 → 데스크탑 카드에서 이미 검증된 패턴 (`bg-backdrop-black/80` 80% 불투명 오버레이) 으로 신뢰 가능
- ❌ 대안 B (2단 유지) — 분위기 신호 약, 데스크탑과 카드 패밀리 분리
- ❌ 대안 C (하이브리드 hero+패널) — 신규 패턴, 데스크탑 baseline 과도 다름, YAGNI

### 3.2 Main 라벨 a 선택 — trade-off 정리

- ✅ BackdropBlur 통일 디자인 + 작은 라벨 chip 으로 공식 룸 신호
- ✅ 1컬럼 리듬 유지
- ⚠️ **의식적 trade-off**: 데스크탑 `MainPartyroomCard` 는 큰 hero (`detail1` 보조 카피 `welcome_party` 까지) 로 일반 카드보다 풍부하지만, 모바일은 `caption2` chip 1줄만 → **Main 카드의 데스크탑↔모바일 격차가 일반 카드 격차보다 오히려 커진다**. 1컬럼 폼팩터에서 hero 가 약하다는 chunk 2 의 framing 을 일관되게 적용한 결과 (Q3 b 거절 근거와 동일). 후속 chunk 에서 Main 전용 모바일 hero 가 재논의될 가능성 열어둠.
- ❌ 대안 b (별도 hero) — 1컬럼 리듬 깨짐 + 신규 컴포넌트
- ❌ 대안 c (라벨 없이 유지) — Main 정체성 손실

### 3.3 구현 A2 선택 — trade-off 정리

- ✅ shared 컴포넌트만 차용, `features-mobile` ↔ `features` 분리 유지
- ✅ 변경 격리 (한 파일 + 테스트)
- ✅ 데스크탑 무영향
- ❌ 대안 A1 (데스크탑 카드 직접 import) — className 충돌 + 분기 prop 필요, 결국 fork 와 비슷한 복잡도
- ❌ 대안 A3 (responsive 통합) — chunk 5 스코프 초과 + 회귀 위험

### 3.4 PFInfoOutline 제외 근거 (확장)

데스크탑 `PartyroomCard` 의 `PFInfoOutline` 은 현재 코드상 `role='presentation'` + 클릭 핸들러 없음 → **정적 아이콘**. 카드 전체가 `Link` 이므로 어차피 탭 시 룸 진입. 실제 정보 표시 affordance 가 아니다.

모바일 전환 깔때기 lens 에서:

- 모바일 탭 진입은 직관 — 별도 affordance 신호 redundant
- 좁은 카드 공간에 추가 아이콘은 시각 노이즈
- 정보 기능 없는 정적 아이콘 → cost > benefit

미래에 PFInfoOutline 이 실제 정보 affordance (예: 룸 미리보기 모달) 로 진화하면 그 시점에 모바일 포함 재검토. 지금은 제외.

## 4. 설계 (How)

### 4.1 Architecture

```
src/features-mobile/partyroom/list/
├── partyroom-card.component.tsx          # rewrite (BackdropBlur 단일 패턴)
├── partyroom-card.component.test.tsx     # 업데이트 (아바타·Typography·Main 라벨 케이스)
├── partyroom-list.component.tsx          # 변경: Main 카드에 isMain prop 전달
└── index.ts                              # 변경 없음
```

영향 파일 = **3개**. 데스크탑 `PartyroomCard` / `MainPartyroomCard` 무영향.

### 4.2 컴포넌트 명세 — `MobilePartyroomCard`

```tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import Crews from '@/features/partyroom/list/ui/crews.component';
import { getPartyroomCardBackdropProps } from '@/features/partyroom/list/ui/partyroom-card-backdrop';
import { PartyroomSummary } from '@/shared/api/http/types/partyrooms';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { BackdropBlurContainer } from '@/shared/ui/components/backdrop-blur-container';
import { Typography } from '@/shared/ui/components/typography';

interface Props {
  roomId: number;
  summary: PartyroomSummary;
  onClose?: () => void;
  /** Main 카드일 때 true → "PFPlay Main Stage" 라벨 표시 */
  isMain?: boolean;
}

/**
 * Main 라벨 sub-컴포넌트.
 *
 * isMain=true 분기에서만 마운트 → `useI18n` 호출이 라벨 케이스에 한정.
 * 일반 카드 (isMain=false) 는 이 컴포넌트를 마운트하지 않으므로 i18n provider 의존 X.
 * (기존 v1 카드 단위 test 들이 i18n mock 없이 통과하는 invariant 보존.)
 */
const MainStageLabel: FC = () => {
  const t = useI18n();
  return (
    <Typography type='caption2' className='text-gray-300 uppercase tracking-wide'>
      {t.lobby.para.pfplay_main_stage}
    </Typography>
  );
};

/**
 * 모바일 로비 1컬럼 카드 (chunk 5 = 데스크탑 baseline catch-up).
 *
 * - 데스크탑 PartyroomCard 와 동일한 BackdropBlur 단일 카드 패턴, 모바일 폼팩터로 축소.
 * - shared 컴포넌트 (BackdropBlurContainer, Typography, Crews) 차용.
 * - PFInfoOutline 은 모바일에서 의도적으로 제외 (정보 기능 없는 정적 아이콘).
 * - isMain=true 일 때 title2 위 caption2 chip 으로 "PFPlay Main Stage" 라벨 (MainStageLabel sub-컴포넌트로 분리).
 */
const MobilePartyroomCard: FC<Props> = ({ roomId, summary, onClose, isMain }) => {
  return (
    <BackdropBlurContainer
      src={summary.playback?.thumbnailImage}
      {...getPartyroomCardBackdropProps(summary.playback?.thumbnailImage)}
    >
      <Link
        href={`/parties/${roomId}?source=list`}
        onClick={onClose}
        className='h-full flexCol justify-between gap-10 py-5 px-5 backdrop-blur-sm bg-backdrop-black/80'
      >
        <div className='flexCol gap-1.5'>
          {isMain && <MainStageLabel />}
          <Typography type='title2' className='text-gray-50'>
            {summary.title}
          </Typography>
        </div>

        <div className='gap-3 flexCol max-w-full'>
          {summary.playback && (
            <div className='flex-1 max-w-full min-w-0 flexRowCenter gap-3 rounded'>
              <div className='w-[64px] h-[36px] bg-gray-700 shrink-0'>
                <Image
                  priority
                  src={summary.playback.thumbnailImage}
                  alt='playback thumbnail'
                  width={64}
                  height={36}
                  className='w-full h-full object-contain select-none'
                />
              </div>
              <Typography
                type='caption1'
                overflow='ellipsis'
                className='flex-1 text-gray-50 select-none'
              >
                {summary.playback.name}
              </Typography>
            </div>
          )}
          <div className='bg-gray-600 h-[1px]' />
          <Crews
            count={summary.crewCount}
            icons={summary.primaryIcons.map((a) => a.avatarIconUri)}
          />
        </div>
      </Link>
    </BackdropBlurContainer>
  );
};

export default MobilePartyroomCard;
```

### 4.3 데스크탑과의 spacing 차이 (의도된 모바일 폼팩터 조정)

| 항목                  | 데스크탑                                                                     | 모바일                                                                                                           | 근거                                                             |
| --------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 좌우 패딩             | `px-7` (28px)                                                                | `px-5` (20px)                                                                                                    | 모바일 폭 좁음                                                   |
| 상하 패딩             | `py-6` (24px)                                                                | `py-5` (20px)                                                                                                    | 카드 세로 컴팩트                                                 |
| 상하단 블록 gap       | `gap-[61px]`                                                                 | `gap-10` (40px)                                                                                                  | 카드 세로 축소                                                   |
| now-playing 썸네일    | 80×44                                                                        | 64×36                                                                                                            | 모바일 폭 좁음                                                   |
| now-playing inner gap | `gap-[12px]`                                                                 | `gap-3` (12px)                                                                                                   | 동일                                                             |
| 하단 블록 inner gap   | `gap-4`                                                                      | `gap-3` (12px)                                                                                                   | 컴팩트                                                           |
| 하단 영역 alignment   | `justify-between` (Crews 좌·PFInfoOutline 우)                                | (justify-between 제거)                                                                                           | PFInfoOutline 제외로 Crews 단독 좌정렬                           |
| Typography 토큰       | title2 (제목) / caption1 (now-playing 곡명) / body3 (Crews count, inherited) | **동일** (모바일이 직접 사용: title2 + caption1 + caption2 (Main 라벨). body3 는 Crews 내부 hardcoded inherited) | 모바일 1컬럼 카드 폭이 데스크탑 카드와 유사 → 사이즈 다운 불필요 |
| **Main 라벨**         | (별도 `MainPartyroomCard` 가 처리)                                           | `caption2` chip (gray-300, uppercase, tracking-wide)                                                             | 일반 카드 디자인 위 라벨 추가만으로 정체성                       |

### 4.4 컴포넌트 명세 — `MobilePartyroomList` (Main 카드 isMain 전달)

Main 카드와 일반 카드를 **명시적으로 분리해서 prepend**. `isMain` 판정 로직이 컴포넌트가 아닌 데이터 소스 (mainRoom vs generalRooms) 에 직접 매핑됨.

```tsx
return (
  <ul className='flexCol gap-4 w-full'>
    {mainRoom && (
      <li key={mainRoom.partyroomId}>
        <MobilePartyroomCard roomId={mainRoom.partyroomId} summary={mainRoom} isMain />
      </li>
    )}
    {generalRooms?.map((summary) => (
      <li key={summary.partyroomId}>
        <MobilePartyroomCard roomId={summary.partyroomId} summary={summary} />
      </li>
    ))}
  </ul>
);
```

**거절된 대안 (idx 기반)**: ❌ `rooms.map((s, idx) => <Card isMain={idx === 0 && !!mainRoom} />)` 형태. generalRooms 정렬 변경에 fragile + isMain 판정이 list 위치에 결합됨. 채택하지 않음.

### 4.5 Crews 컴포넌트 cross-import 결정

`Crews` 와 `getPartyroomCardBackdropProps` 는 `features/partyroom/list/ui/` 에 있다. `features-mobile/` 에서 `features/` 를 import 하는 것은 일반적으로 layered architecture 에서 회피하지만, 본 작업에서는 다음 이유로 cross-import 채택:

- `Crews` 는 stateless presentation 컴포넌트, hooks/store 의존 없음
- shared 로 hoist 하려면 데스크탑 코드도 함께 수정해야 함 — chunk 5 스코프 초과
- 후속 chunk 에서 다른 모바일 화면이 `Crews` 를 쓰게 되면 그 시점에 hoist 재검토 (YAGNI)
- **lint enforcement 확인**: `eslint.config.js` 에 `features-mobile → features` import 차단 룰 없음 (no `boundaries` / `no-restricted-paths` 설정). lint red 우려 없음

대안: 로컬에 동일 컴포넌트를 복제 — 코드 중복, 사용자 메모리 `feedback_elegant_no_code_dirtying` (코드 더럽힘 회피) 위반.

### 4.6 Data Flow

변경 없음. `useFetchGeneralPartyrooms` + `useSuspenseFetchMainPartyroom` 은 같은 `/api/v1/partyrooms` getList 응답을 query key 공유로 단일 fetch + 다른 select. `PartyroomSummary.primaryIcons` 는 이미 응답 포함 (백엔드 API 변경 0).

기존 v1 test mock 에도 `primaryIcons: [{ avatarIconUri: '/avatar.png' }]` 가 있어 단지 컴포넌트가 무시 중 → 카드만 고치면 실데이터 자동 연결.

### 4.7 Error Handling

| 케이스                         | 처리                                                                                                                                                                                     | 비고                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `playbackActivated=false`      | now-playing 블록 전체 미렌더 (`{summary.playback && ...}`)                                                                                                                               | 현재 v1 의 "재생 중인 곡이 없어요" placeholder 는 **삭제** (사용자 가시 동작 변화 — PR body 명시 필요). BackdropBlur 자체는 fallback 이미지 `/images/Background/Partyroom.png` 로 채워지므로 빈 카드 X. 데스크탑 카드 동일 동작이라 분위기 손상 우려 검증됨. 깔때기 lens 통과: "재생 중 곡 없음" 표시 사라짐 = inactive 신호 약화 ≠ active 신호 약화 → 전환 깔때기에는 중립 |
| `playback.thumbnailImage` 부재 | `BackdropBlurContainer` 가 `getPartyroomCardBackdropProps` fallback 처리 — fallbackSrc=`/images/Background/Partyroom.png`, imageClassName=`object-[24%_60%] scale-110` (데스크탑과 동일) | shared 컴포넌트 자체 처리                                                                                                                                                                                                                                                                                                                                                   |
| `primaryIcons` 빈 배열         | `Crews` 가 `icons.slice(0, 3)` 으로 안전 처리, count 만 표시                                                                                                                             | `PartyroomSummary` 주석 "최소한 호스트 1명에 대한 정보는 있음" — 빈 배열 실제 발생 X                                                                                                                                                                                                                                                                                        |
| `crewCount=0`                  | `Crews` 가 `count ? count : 0` 처리                                                                                                                                                      | 기존 동일                                                                                                                                                                                                                                                                                                                                                                   |
| 긴 제목                        | `Typography type='title2'` 가 자동 truncate (titleTypes)                                                                                                                                 | 데스크탑과 동일                                                                                                                                                                                                                                                                                                                                                             |

### 4.8 Testing

#### 단위 — `partyroom-card.component.test.tsx`

기존 3 케이스 유지 + 다음 수정/추가:

1. **제목·인원·now-playing 표시** (기존) — 통과 예상 (raw text → Typography 변경은 텍스트 매칭 무영향, `isMain` 미지정 → `MainStageLabel` 미마운트 → i18n provider mock 불필요)
2. **카드 전체가 `/parties/{id}?source=list` 로 이동** (기존) — 그대로 통과 (i18n mock 불필요)
3. **`playbackActivated=false` 케이스** — 수정: "재생 중인 곡이 없어요" placeholder 단언 제거, now-playing 영역이 **렌더되지 않음** 단언으로 변경 (예: `screen.queryByAltText('playback thumbnail')` 가 null). i18n mock 불필요
4. **신규: 아바타가 `primaryIcons` 개수만큼 렌더** — `screen.getAllByAltText('party crew').length === 1` (mock primaryIcons 1개 기준). i18n mock 불필요
5. **신규: `isMain=true` 일 때 "PFPlay Main Stage" 라벨 표시** — **i18n mock 필요** (`vi.mock('@/shared/lib/localization/i18n.context', () => ({ useI18n: () => ({ lobby: { para: { pfplay_main_stage: 'PFPlay Main Stage' } } }) }))` 패턴, 참조: `src/widgets-mobile/partyroom-queue-panel/ui/guest-cta.component.test.tsx`). `screen.getByText('PFPlay Main Stage')` 단언
6. **신규: `isMain` 이 falsy 일 때 라벨 미표시** — `screen.queryByText('PFPlay Main Stage')` 가 null. 동일 i18n mock 적용된 상태에서 prop 차이만 검증

**Mock 정리**:

- `next/image` — 기존 mock 유지 (Crews 안 `<Image priority />` 까지 커버)
- `next/link` — 기존 mock 유지
- `@/shared/lib/localization/i18n.context` — **케이스 5·6 전용**. 파일 상단 `vi.mock(...)` 하나로 전역 stub. 케이스 1·2·3·4 는 `<MainStageLabel />` 미마운트라 mock 미사용. 케이스 1·2·3·4 가 mock 영향받지 않는지 (의도치 않은 dependency leak) 확인하는 게 본 spec 의 invariant
- `@/shared/ui/icons` (PFPersonFilled, Crews 안에서 import) — Vitest 가 svg/icon 컴포넌트를 그대로 처리 가능하면 mock 불필요. 처음 test 실행 시 unresolved import 발생하면 `vi.mock` 추가. plan 단계에서 dry-run 으로 확인 (mock 추가 여부는 implementation 가 결정)

#### 통합 / E2E

- 기존 `MobilePartyroomList` 단위 test 가 있으면 Main 카드에 `isMain` prop 전달 케이스 추가. 없으면 카드 단위 test 로 충분 (YAGNI)
- 기존 모바일 lobby e2e 가 카드 텍스트 (`getByText`) 로 단언하는 부분 점검 필요 — 텍스트 컨텐츠 자체는 변경 없으므로 영향 없을 가능성 높음
- 시각 회귀 (BackdropBlur 적용 후 카드 배경) 는 e2e 화면 캡처가 있는 spec 만 영향 — 사전 grep 필요

## 5. 검증 / 종료 기준 (Done)

- [ ] `MobilePartyroomCard` rewrite + 단위 test 6 케이스 GREEN
- [ ] `MobilePartyroomList` 의 Main 카드 `isMain` prop 전달 검증
- [ ] `yarn typecheck` 0 오류
- [ ] `yarn lint` clean
- [ ] 로컬 `npx next dev` (http+webpack, 메모리 `reference_pfplay_web_local_dev_http_webpack` 준수) 실측 — 데스크탑 viewport `~/parties` 무영향, 모바일 viewport BackdropBlur·Crews·Main 라벨 렌더 확인
- [ ] e2e suite (모바일 lobby 관련) 영향 점검 + 회귀 확인
- [ ] PR 본문 한국어, closes #(issue). **PR body 에 사용자 가시 동작 변화 1건 명시: "playbackActivated=false 일 때 '재생 중인 곡이 없어요' placeholder 텍스트 제거 (BackdropBlur fallback 이미지로 대체)"**

## 6. 위험·완화

| 위험                                                                                     | 영향                     | 완화                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 어두운 썸네일 + 밝은 BackdropBlur 텍스트 가독성 저하                                     | 사용성 ↓                 | 데스크탑 검증된 `bg-backdrop-black/80` 80% 불투명 오버레이 그대로 차용                                                                                                                                                                                                    |
| `Crews` cross-import (`features-mobile` → `features`) 로 layering 오염                   | 아키텍처 일관성          | stateless presentation 한정 + 후속 chunk 에서 다른 모바일 사용처 발생 시 shared 로 hoist                                                                                                                                                                                  |
| 모바일 e2e spec 의 텍스트 단언 실패                                                      | CI red                   | spec 작성 시 사전 grep, 영향 spec 의 단언 텍스트 재확인                                                                                                                                                                                                                   |
| Main 라벨 i18n 키 미렌더 (provider mock 부재)                                            | test red                 | 케이스 5·6 에 한정해 `vi.mock('@/shared/lib/localization/i18n.context', () => ({ useI18n: () => ({ ... }) }))` 패턴 적용. 참조: `src/widgets-mobile/partyroom-queue-panel/ui/guest-cta.component.test.tsx`. (데스크탑 카드 ui/ 하위에는 test 파일 자체 없음 — 0건 확인됨) |
| `MainStageLabel` sub-컴포넌트 분리 안 했을 때 기존 케이스 1~4 가 i18n provider mock 강제 | test red (4 케이스 일괄) | `MainStageLabel` 분리로 useI18n 호출이 라벨 케이스에만 한정 — §4.2 코드 명세로 lock                                                                                                                                                                                       |

## 7. 변경 요약

| 파일                                                                   | 변경                                                                                                              |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `src/features-mobile/partyroom/list/partyroom-card.component.tsx`      | rewrite (BackdropBlur 단일 패턴, Typography 토큰, Crews 차용, `MainStageLabel` sub-컴포넌트 분리, Main 라벨 분기) |
| `src/features-mobile/partyroom/list/partyroom-card.component.test.tsx` | 케이스 6개 (기존 3 유지/수정 + 신규 3 — 5·6 에 한해 i18n mock)                                                    |
| `src/features-mobile/partyroom/list/partyroom-list.component.tsx`      | Main 카드 prepend 시 `isMain` prop 전달                                                                           |

영향 파일 = **3개**, 신규 file-level 컴포넌트 = **0** (sub-컴포넌트 `MainStageLabel` 은 카드 파일 내부에 colocate), 신규 i18n 키 = **0**, 백엔드 API 변경 = **0**.
