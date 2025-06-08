<div align="center">
  <img src="./public/images/Logo/Symbol_medium_red.png" alt="Logo" width="100px">
  <br />
  <br />
  <div align="center">
    <img alt="badge_react" src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=React&logoColor=black" />
    <img alt="badge_typescript" src="https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
    <img alt="badge_nextjs" src="https://img.shields.io/badge/NEXT.JS-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  </div>
  <br />
  <div align="center">
    <a aria-label="Node Version" href="https://nodejs.org/en">
        <img alt="" src="https://img.shields.io/badge/node->=20.16.0-339933?logo=nodedotjs">
    </a>
    <a aria-label="Npm Version" href="https://classic.yarnpkg.com/en/">
        <img alt="" src="https://img.shields.io/badge/yarn->=1.22.22-237397?logo=yarn">
    </a>
  </div>
  <br />
  <div align="center">
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
  <h1 align="center">PFPlay</h1>
  <p align="center">
      우리는 PFP NFT와 디제잉을 결합한 소셜 플랫폼을 만들어 새로운 디깅 문화를 만들어갑니다.
      <br />
      This is <strong>frontend repository</strong> for <strong>PFPlay</strong>.
  </p>
</div>

## 🎯 Overview

PFPlay는 NFT와 음악 디제잉을 결합한 소셜 플랫폼을 만들어 PFP NFT의 새로운 사용처가 됩니다. 다양한 커뮤니티를 포용하며, 음악을 직접 스트리밍하거나 비슷한 취향을 공유하는 사람들과 연결되어 새로운 음악 디깅 문화를 만들어가는 독특하고 몰입감 있는 경험을 제공합니다.

## 배포 환경

[![DEV](https://img.shields.io/badge/DEV-https%3A%2F%2Fpfplay--web.vercel.app-blue)](https://pfplay-web.vercel.app)
[![PROD](https://img.shields.io/badge/PROD-https%3A%2F%2Fpfplay.xyz-blue)](https://pfplay.xyz)

## 🚀 Quick Start Guide

### Prerequisites

프로젝트 실행을 위한 필수 요구사항:

- Node.js >= 20.16.0
- Yarn >= 1.22.22

### Installation

```bash
git clone https://github.com/{your-id}/pfplay-web.git
cd pfplay-web
yarn install
```

### Basic Usage

```bash
# 의존성 설치
yarn

# 개발 서버 실행
yarn dev

# 스토리북 실행
yarn storybook

```

### Environment Setup

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

자세한 환경 변수 설정은 노션의 [[FE]환경변수](https://www.notion.so/pfplay/FE-bf4846ff10e74216871d972effa252c2?pvs=4)을 참고해주세요.

## ✨ Features

### 파티룸

- 실시간 음악 스트리밍 서비스
- 권한에 따른 크루(파티룸 참여 유저) 관리 시스템
- 실시간 채팅 및 이모지 리액션
- 플레이리스트 관리

### 🎧 음악 스트리밍

- DJ에 의한 실시간 음악 재생 및 동기화
- 큐레이션된 플레이리스트

### 👥 소셜 기능

- 실시간 채팅
- 프로필 커스터마이징
- 파티룸 초대 링크

### Web3 통합

PFPlay는 [RainbowKit](https://www.rainbowkit.com/)과 [wagmi](https://wagmi.sh/)를 사용하여 다양한 Web3 지갑을 지원합니다.

#### 지원하는 지갑

- MetaMask
- Rainbow Wallet
- Coinbase Wallet
- WalletConnect

#### 지갑 연동 방법

1. 앱 실행 후 아바타 설정 창에서'Connect Wallet' 버튼을 클릭합니다.
2. 지원되는 지갑 목록에서 원하는 지갑을 선택합니다.
3. 각 지갑별 필요 사항:
   - **MetaMask**: 브라우저에 MetaMask 확장 프로그램이 설치되어 있어야 합니다.
   - **Rainbow Wallet**: 모바일에서는 Rainbow 앱 설치가 필요합니다.
   - **Coinbase Wallet**: Coinbase Wallet 앱 또는 브라우저 확장 프로그램이 필요합니다.
   - **WalletConnect**: QR 코드를 스캔할 수 있는 모바일 지갑 앱이 필요합니다.

> 💡 처음 Web3 지갑을 사용하시는 경우, MetaMask 설치를 권장합니다.

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

### Core stack

- Next.js 14
- React 18
- TypeScript

### Styling

- Tailwind CSS
- [Headless UI](https://headlessui.com/)

### State Management

- TanStack Query
- Zustand

### Web3 Integration

- [Wagmi](https://wagmi.sh/) - 이더리움 데이터 처리 및 지갑 연동
- [WalletConnect](https://walletconnect.com/) - 크로스 플랫폼 지갑 연결
- [Alchemy SDK](https://www.alchemy.com/) - NFT 데이터 조회
- [Rainbow kit](https://rainbowkit.com/docs/installation) - 직관적이고 커스터마이징 가능한 지갑 연결 UI 라이브러리

### Development Tools

- Storybook - 컴포넌트 개발 및 문서화
- ESLint - 코드 품질 관리
- Prettier - 코드 포맷팅
- Jest - 유닛 테스트

## 📚 개발 가이드 및 프로젝트 문서

프로젝트의 모든 문서는 목적과 위치에 따라 체계적으로 관리됩니다. [docs/DOCS_ENTRY.md](./docs/DOCS_ENTRY.md)에서 다음과 같은 문서들을 찾아보실 수 있습니다:

- **기술 문서**
  - React Query 사용 가이드
  - 채팅 시스템 구현 가이드
  - 지갑 연동 가이드
- **컴포넌트/기능별 문서**
  - 파티룸 클라이언트
  - 플레이리스트
  - UI 상태 관리

각 기능과 컴포넌트의 세부 구현 방법이나 사용법은 해당 디렉토리의 README.md를 참조해주세요.

## 📚 Additional Resources

- [FE 문서](https://www.notion.so/pfplay/FE-5e7cd836945f47b98c49e2c66e4bf949?pvs=4)
- [API Documentation](https://www.notion.so/pfplay/d98a31774252496fa54492e4d5bc25ff)
- [Swagger](https://pfplay-api.app/spec/swagger-ui/index.html)
- [Design System - Figma](https://www.figma.com/file/9I5PR6OqN8cHJ7WVTOKe00/PFPlay-GUI-%EC%84%A4%EA%B3%84%EC%84%9C-%ED%95%A9%EB%B3%B8)
