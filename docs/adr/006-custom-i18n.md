# ADR-006: next-intl/i18next 대신 커스텀 i18n 구현

- **상태**: 채택됨
- **일자**: 2024-06

## 맥락

다국어 지원(한국어/영어)이 필요하다. Next.js App Router 환경에서 서버 컴포넌트와 클라이언트 컴포넌트 모두에서 번역 텍스트를 사용해야 하며, 번역 문자열 내에 **볼드 처리, 줄바꿈, 변수 치환** 같은 서식이 포함된다.

## 선택지

| 선택지          | 장점                                   | 단점                             |
| --------------- | -------------------------------------- | -------------------------------- |
| next-intl       | App Router 네이티브 지원               | 2024 당시 App Router 지원 불안정 |
| react-i18next   | 생태계 풍부                            | SSR 설정 복잡, 번들 크기 큼      |
| **커스텀 구현** | 경량, 완전한 제어, 프로세서 파이프라인 | 유지보수 부담, 생태계 부재       |

## 결정

**커스텀 i18n 시스템**을 구현한다.

### 아키텍처

```
서버: getServerDictionary() → JSON 동적 import → I18nProvider에 주입
                                                       ↓
클라이언트: useI18n() → t.partyroom.ec.shut_down (타입 안전)
                                                       ↓
            <Trans i18nKey="..." processors={[bold, lineBreak, variable]} />
                        ↓
            프로세서 파이프라인 → **bold** → <b>, \n → <br/>, {{name}} → value
```

### 프로세서 파이프라인

`Trans` 컴포넌트가 `I18nProcessor` 인터페이스를 구현한 프로세서 배열을 받아 순차 적용한다:

- `LineBreakProcessor` — `\n` → `<br />`
- `BoldProcessor` — `**텍스트**` → `<b className="text-red-300">텍스트</b>`
- `VariableProcessor` — `{{name}}` → 실제 값 치환

### 핵심 파일

- `src/shared/lib/localization/get-server-dictionary.ts` — 서버 사이드 딕셔너리 로딩
- `src/shared/lib/localization/i18n.context.tsx` — Context + useI18n 훅
- `src/shared/lib/localization/lang.context.tsx` — 언어 선택 Context
- `src/shared/lib/localization/renderer/trans.component.tsx` — Trans 컴포넌트
- `src/shared/lib/localization/renderer/processors/` — 프로세서 구현체

## 결과

- **(+)** 타입 안전한 키 접근 — `Leaves<Dictionary>` 타입으로 오타 방지
- **(+)** 프로세서 파이프라인으로 서식 처리 확장 용이
- **(+)** 번들 크기 최소 — 외부 라이브러리 의존 없음
- **(+)** 서버/클라이언트 양쪽에서 동일하게 동작
- **(-)** 복수형(pluralization), 날짜/숫자 포맷 등 고급 기능 미지원
- **(-)** 외부 번역 서비스(Crowdin, Phrase) 연동 시 추가 작업 필요
