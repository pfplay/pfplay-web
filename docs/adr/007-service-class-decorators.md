# ADR-007: API 서비스 계층에 클래스 + 데코레이터 패턴 채택

- **상태**: 채택됨
- **일자**: 2024-06

## 맥락

API 서비스 계층에서 다음 횡단 관심사(cross-cutting concerns)를 처리해야 한다:

1. **싱글턴 보장** — 서비스 인스턴스가 하나만 존재
2. **에러 핸들링 정책** — 특정 메서드만 전역 에러 처리를 건너뜀
3. **개발용 모킹** — 백엔드 미구현 API를 프론트 단독으로 테스트

함수형 모듈로 구현하면 이런 횡단 관심사를 메서드별로 적용하기 어렵다.

## 선택지

| 선택지                  | 장점                         | 단점                              |
| ----------------------- | ---------------------------- | --------------------------------- |
| 함수형 모듈 + HOF       | React 생태계와 일관          | 메서드별 정책 적용 번거로움       |
| **클래스 + 데코레이터** | AOP 스타일, 선언적 정책 적용 | TS 데코레이터 실험적, 클래스 패턴 |

## 결정

**TypeScript 클래스 + 데코레이터 패턴**을 채택한다.

### 3종 데코레이터

```ts
@Singleton                          // 클래스 데코레이터 — 인스턴스 하나만 생성
class PlaylistsService {

  @MockResolve({ data: mockData })  // 메서드 데코레이터 — 개발 모킹
  async getPlaylists() { ... }

  @SkipGlobalErrorHandling({        // 메서드 데코레이터 — 에러 정책
    when: (err) => err.response?.data?.errorCode === 'PLL-002'
  })
  async createPlaylist() { ... }
}
```

| 데코레이터                     | 레벨   | 역할                                |
| ------------------------------ | ------ | ----------------------------------- |
| `@Singleton`                   | 클래스 | new 호출 시 기존 인스턴스 반환      |
| `@SkipGlobalErrorHandling`     | 메서드 | 조건부 전역 에러 처리 억제          |
| `@MockResolve` / `@MockReturn` | 메서드 | `USE_MOCK=true`일 때 가짜 응답 반환 |

### 적용 대상

- `src/shared/api/http/services/users.ts`
- `src/shared/api/http/services/partyrooms.ts`
- `src/shared/api/http/services/playlists.ts`
- `src/shared/api/http/services/crews.ts`
- `src/shared/api/http/services/djs.ts`

### 핵심 파일

- `src/shared/lib/decorators/singleton/` — @Singleton
- `src/shared/lib/decorators/skip-global-error-handling/` — @SkipGlobalErrorHandling
- `src/shared/lib/decorators/mock/` — @MockResolve, @MockReturn

## 결과

- **(+)** 횡단 관심사가 비즈니스 로직과 분리 — 메서드 본문은 순수 API 호출만
- **(+)** 선언적 — 데코레이터 한 줄로 정책 적용
- **(+)** 3종 데코레이터 모두 유닛 테스트 완료
- **(-)** TypeScript `experimentalDecorators` 의존 — TC39 표준과 다소 차이
- **(-)** 프론트엔드에서 클래스 패턴이 비주류 — 팀 온보딩 시 설명 필요
