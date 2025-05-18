# 250519 기준 프로젝트 문서 목록

## root

### docs

- [docs/REACT_QUERY.md](./REACT_QUERY.md) - 서버 상태 관리를 위한 React Query 라이브러리 사용 가이드. API 데이터 호출, 캐싱, 동기화 등을 효율적으로 처리하고 싶을 때 참고하세요.
- [docs/README.md](./README.md) - 프로젝트의 전반적인 개요, 설정 방법, 실행 방법 등을 안내합니다. 프로젝트를 처음 시작하거나 전체 구조를 파악하고 싶을 때 읽어보세요.
- [docs/CONTRIBUTING.md](./CONTRIBUTING.md) - 프로젝트에 기여하는 방법을 안내합니다. 코드 스타일, 브랜치 전략, PR 규칙 등을 확인할 수 있습니다.
- [docs/FLOW.md](./FLOW.md) - 프로젝트의 주요 기능 흐름 또는 개발 워크플로우를 설명합니다. 특정 기능의 동작 방식이나 전체적인 서비스 흐름을 이해하고 싶을 때 유용합니다.

## src

### shared/lib

- #### Chat
  - [src/shared/lib/chat/README.md](../src/shared/lib/chat/README.md) - 실시간 채팅 기능 구현에 필요한 라이브러리 사용법 및 가이드입니다. 채팅 메시지 전송, 수신, UI 연동 등을 개발할 때 참고하세요.
- #### Decorators
  - [src/shared/lib/decorators/skip-global-error-handling/README.md](../src/shared/lib/decorators/skip-global-error-handling/README.md) - 특정 함수나 메소드에서 전역 에러 핸들러의 작동을 건너뛰고 싶을 때 사용하는 데코레이터입니다.
  - [src/shared/lib/decorators/mock/README.md](../src/shared/lib/decorators/mock/README.md) - 개발 및 테스트 환경에서 API 응답을 모킹하거나 특정 함수의 동작을 가상으로 대체할 때 사용하는 데코레이터입니다.
  - [src/shared/lib/decorators/singleton/README.md](../src/shared/lib/decorators/singleton/README.md) - 클래스의 인스턴스를 하나만 생성하도록 보장하는 싱글턴 패턴을 적용할 때 사용하는 데코레이터입니다.
- #### Localization
  - [src/shared/lib/localization/renderer/README.md](../src/shared/lib/localization/renderer/README.md) - 다국어 지원(i18n)을 위한 텍스트 렌더링 및 지역화 처리 방법을 안내합니다. 다양한 언어로 서비스를 제공해야 할 때 참고하세요.

### entities

- [src/entities/partyroom-client/README.md](../src/entities/partyroom-client/README.md) - '파티룸 클라이언트'와 관련된 데이터 구조, 상태 관리 로직 등을 설명합니다. 파티룸 기능 중 클라이언트 측면을 개발할 때 참고하세요.
- [src/entities/playlist/README.md](../src/entities/playlist/README.md) - '플레이리스트' 관련 데이터 모델, 기능, 상태 관리 방법을 설명합니다. 음악 재생 목록 관리 기능을 개발할 때 참고하세요.
- [src/entities/wallet/README.md](../src/entities/wallet/README.md) - '사용자 지갑' 관련 데이터 구조 및 관리 로직을 설명합니다. 포인트, 재화 등 지갑 기능을 개발할 때 참고하세요.
- [src/entities/current-partyroom/README.md](../src/entities/current-partyroom/README.md) - 현재 사용자가 참여하고 있는 '파티룸 정보'를 관리하는 엔티티에 대한 설명입니다. 실시간 파티룸 상태 동기화 등에 활용됩니다.
- [src/entities/ui-state/README.md](../src/entities/ui-state/README.md) - 전반적인 UI 상태(예: 모달 열림/닫힘, 테마 설정 등)를 관리하는 엔티티에 대한 설명입니다. UI 컴포넌트들의 상태를 일관되게 관리하고 싶을 때 참고하세요.
