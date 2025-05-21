<div style="text-align: center">
  <img src="../public/images/Logo/Symbol_medium_red.png" alt="Logo" width="100px">
  <br />
  <br />
  <div>
    <img alt="badge_react" src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=React&logoColor=black" />
    <img alt="badge_typescript" src="https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
    <img alt="badge_nextjs" src="https://img.shields.io/badge/NEXT.JS-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  </div>
  <br />
  <div>
    <a aria-label="Node Version" href="https://chequer.slack.com/archives/C046888P2Q0">
        <img alt="" src="https://img.shields.io/badge/node->=20.16.0-339933?logo=nodedotjs">
    </a>
    <a aria-label="Npm Version" href="https://chequer.slack.com/archives/C046888P2Q0">
        <img alt="" src="https://img.shields.io/badge/yarn->=1.22.22-237397?logo=yarn">
    </a>
  </div>
  <br />
  <div>
    <a aria-label="Front Slack Channel" href="https://pfplay.slack.com/archives/C051ZQSV205">
        <img alt="" src="https://img.shields.io/badge/slack-4A154B?logo=slack">
    </a>
    <a aria-label="Front Notion Notion" href="https://www.notion.so/pfplay/FE-5e7cd836945f47b98c49e2c66e4bf949?pvs=4">
        <img alt="" src="https://img.shields.io/badge/wiki-black?logo=notion">
    </a>
    <a aria-label="Figma" href="https://www.figma.com/file/9I5PR6OqN8cHJ7WVTOKe00/PFPlay-GUI-%EC%84%A4%EA%B3%84%EC%84%9C-%ED%95%A9%EB%B3%B8?type=design&node-id=1%3A17&mode=design&t=v01tSWKTB86CkcfO-1">
        <img alt="" src="https://img.shields.io/badge/Figma-black?logo=figma&logoColor=F24E1E">
    </a>
  </div>
  <h1>PFPlay</h1>
  <p>
      우리는 PFP NFT와 디제잉을 결합한 소셜 플랫폼을 만들어 새로운 디깅 문화를 만들어갑니다.
      <br />
      This repository is <strong>frontend for PFPlay</strong>.
  </p>
</div>

## 🎯 Overview

PFPlay는 Web3 기술을 활용한 소셜 뮤직 플랫폼입니다.

### 주요 기능

- NFT 지갑 연동 및 프로필 설정
- 파티룸 생성 및 참여
- 실시간 음악 스트리밍
- Chatting 기능을 포함한 소셜 인터랙션

### 배포 환경

[![DEV](https://img.shields.io/badge/DEV-https%3A%2F%2Fpfplay--web.vercel.app-blue)](https://pfplay-web.vercel.app)
[![PROD](https://img.shields.io/badge/PROD-https%3A%2F%2Fpfplay.xyz-blue)](https://pfplay.xyz)

## 📋 Prerequisites

프로젝트 실행을 위한 필수 요구사항:

- Node.js >= 20.16.0
- Yarn >= 1.22.22
- WalletConnect Project ID
- Alchemy API Key

## 🏗 Project Architecture

### Feature-Sliced Design (FSD)

[Feature-Sliced Design](https://www.notion.so/pfplay/FSD-45fde28e6f9d43d1bbd413933cf03789?pvs=4) 아키텍처를 채택하여 다음과 같은 레이어로 구성:

```
src/
├── app/                 # Next.js 라우팅 및 레이아웃
├── entities/
│   ├── wallet/         # 지갑 연동 관련 로직
│   ├── me/             # 사용자 정보 관련
│   └── partyroom/      # 파티룸 관련 로직
│   └── ...
├── features/
│   ├── sign-in/        # 로그인 기능
│   └── playlist/       # 플레이리스트 관련 기능
│   └── ...
├── widgets/
│   └── partyroom-display-board/  # 파티룸 디스플레이 위젯
│   └── ...
└── shared/
    ├── ui/             # 공통 UI 컴포넌트
    ├── api/            # API 클라이언트
    └── lib/            # 유틸리티 함수
    └── ...
```

## 🛠 Tech Stack

### Core

- [Next.js 14](https://nextjs.org/)
- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)

### Web3 Integration

- [wagmi](https://wagmi.sh/) - 이더리움 데이터 처리 및 지갑 연동
- [WalletConnect](https://walletconnect.com/) - 크로스 플랫폼 지갑 연결
- [Alchemy SDK](https://www.alchemy.com/) - NFT 데이터 조회

### State Management & Data Fetching

- [TanStack Query](https://tanstack.com/query/latest) - 서버 상태 관리
- [Zustand](https://zustand-demo.pmnd.rs/) - 클라이언트 상태 관리

### Development Tools

- [Storybook](https://storybook.js.org/) - 컴포넌트 개발 및 문서화

  ```bash
  # Storybook 실행
  yarn storybook

  # Storybook 빌드
  yarn build-storybook
  ```

- [ESLint](https://eslint.org/) - 코드 품질 관리
- [Prettier](https://prettier.io/) - 코드 포맷팅
- [Jest](https://jestjs.io/) - 유닛 테스트

### Styling

- [Tailwind CSS](https://tailwindcss.com/)

## 🔑 Environment Setup

### 환경 변수 설정

```bash
# 환경 변수 파일 생성
touch .env.local .env.development.local .env.production.local

# .env.local
NEXT_PUBLIC_ALCHEMY_PUBLIC_API_KEY=
NEXT_PUBLIC_WAGMI_PROJECT_ID=

# .env.development.local
GOOGLE_ID=
GOOGLE_SECRET=

# .env.production.local
GOOGLE_ID=
GOOGLE_SECRET=
```

자세한 환경 변수 설정은 [[FE]환경변수](https://www.notion.so/pfplay/FE-bf4846ff10e74216871d972effa252c2?pvs=4)을 참고해주세요.

## 🚀 Development

### 프로젝트 설정

```bash
# 의존성 설치
yarn

# 개발 서버 실행
yarn dev

```

### 개발 가이드

- [Contributing Guide](./CONTRIBUTING.md) - 코드 컨벤션, 브랜치 전략
- [FSD Architecture Details](./FSD.md) - 아키텍처 가이드
- [React Query Conventions](./REACT_QUERY.md) - React Query 사용 가이드

## 📚 Additional Resources

- [Frontend Wiki](https://www.notion.so/pfplay/FE-5e7cd836945f47b98c49e2c66e4bf949?pvs=4)
- [API Documentation](https://www.notion.so/pfplay/API-bf4846ff10e74216871d972effa252c2?pvs=4)
- [Design System (Figma)](https://www.figma.com/file/9I5PR6OqN8cHJ7WVTOKe00/PFPlay-GUI-%EC%84%A4%EA%B3%84%EC%84%9C-%ED%95%A9%EB%B3%B8)
