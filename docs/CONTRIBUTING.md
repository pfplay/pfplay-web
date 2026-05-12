> git 브랜치 모델, 커밋 컨벤션 등에 대한 상세한 내용은 노션의 [[FE] Contributing Guide](https://www.notion.so/pfplay/FE-Contributing-Guide-57109e0d68e24b6081e4dc48e6744841?pvs=4) 문서를 참고해주세요.

---

### Work Process

> Last Update (25.05.11)

<div align="center">
  <a aria-label="노션 작업 보드" href="https://www.notion.so/pfplay/468dd7cebdaa4e94924131727bee1440?v=ec525f34140d43ec92b311f3a2a53617&pvs=4">
      <img alt="" src="https://img.shields.io/badge/노션%20작업%20보드-black?logo=notion">
  </a>
  <a aria-label="피그마" href="https://www.figma.com/file/9I5PR6OqN8cHJ7WVTOKe00/PFPlay-GUI-%EC%84%A4%EA%B3%84%EC%84%9C-%ED%95%A9%EB%B3%B8?type=design&node-id=1%3A17&mode=design&t=v01tSWKTB86CkcfO-1">
      <img alt="" src="https://img.shields.io/badge/피그마-black?logo=figma&logoColor=F24E1E">
  </a>
</div>

1. [노션 작업 보드](https://www.notion.so/pfplay/468dd7cebdaa4e94924131727bee1440?v=ec525f34140d43ec92b311f3a2a53617&pvs=4)에 티켓을 등록합니다.
2. 최신 development 브랜치 베이스로 `feature/{Ticket-Number}` 브랜치를 따서 작업합니다.

### Directory Structure

> Last Update (25.05.11)

FSD(Frontend Structure Design) 아키텍쳐를 기반으로 작업합니다.

### Color Theme

> Last Update (24.03.24)

- `tailwind.config.js`에 피그마 파일의 `Component/Color` 섹션 기준으로 컬러 테마를 업데이트 합니다.
- `bg-red-200`, `text-gray-200`, `border-gray-500` 과 같은 형태로 사용 가능합니다.
- vscode를 사용한다면, [vscode-tailwindcss](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) 익스텐션 사용 시 자동 완성을 지원합니다.

### Images

> Last Update (24.03.24)

- 아이콘들
  - ext - `svg`
  - `/public/icons` 디렉터리에 넣고 `yarn svgr` 스크립트를 실행하면, `src/` 하위에 컴포넌트로 빌드됩니다.
- 그 외 이미지들
  - ext - `png|jpg|jpeg|gif|...`
  - `/public/images/` 디렉터리에 넣습니다.

## Testing

> Last Update (26.05.13)

이 프로젝트의 테스트 러너는 **Vitest**입니다 (jest 아님). MSW로 백엔드를 가짜 응답으로 대체하고, Playwright는 e2e 전용입니다.

```bash
# 전체 테스트 (단발, CI용)
yarn test          # = vitest run

# 타입 체크만
yarn test:type     # = tsc --noEmit

# e2e (Playwright)
yarn test:e2e
yarn test:e2e:headed
```

- 테스트 파일은 소스 파일과 **동일 디렉토리에 co-locate** 합니다.
- 네이밍: `{name}.test.ts`, `{name}.component.test.tsx`, `{name}.hook.test.ts`, `{name}.integration.test.ts`
- MSW 통합 테스트 작성 시 `import '@/shared/api/__test__/msw-server'`를 반드시 추가해야 합니다.
- watch / UI 모드가 필요하면 `npx vitest` 또는 `npx vitest --ui` 사용.

상세 가이드는 [TESTING.md](./TESTING.md)를 참고하세요.

## react-query

> Last Update (26.05.13)

서버 상태 관리(쿼리 정책, staleTime, retry 등)는 [REACT_QUERY.md](./REACT_QUERY.md)를 참고하세요.
