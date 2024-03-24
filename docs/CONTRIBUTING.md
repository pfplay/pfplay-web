> git 브랜치 모델, 커밋 컨벤션 등에 대한 상세한 내용은 노션의 [[FE] Contributing Guide](https://www.notion.so/pfplay/FE-Contributing-Guide-57109e0d68e24b6081e4dc48e6744841?pvs=4) 문서를 참고해주세요.

---

### Work Process

> Last Update (24.03.24)

<div align="center">
  <a aria-label="노션 작업 보드" href="https://www.notion.so/pfplay/468dd7cebdaa4e94924131727bee1440?v=ec525f34140d43ec92b311f3a2a53617&pvs=4">
      <img alt="" src="https://img.shields.io/badge/노션%20작업%20보드-black?logo=notion">
  </a>
  <a aria-label="피그마" href="https://www.figma.com/file/9I5PR6OqN8cHJ7WVTOKe00/PFPlay-GUI-%EC%84%A4%EA%B3%84%EC%84%9C-%ED%95%A9%EB%B3%B8?type=design&node-id=1%3A17&mode=design&t=v01tSWKTB86CkcfO-1">
      <img alt="" src="https://img.shields.io/badge/피그마-black?logo=figma&logoColor=F24E1E">
  </a>
</div>

1. [노션 작업 보드](https://www.notion.so/pfplay/468dd7cebdaa4e94924131727bee1440?v=ec525f34140d43ec92b311f3a2a53617&pvs=4)에 티켓을 등록합니다.
2. 최신 develop 브랜치 베이스로 `feature/{Ticket-Number}` 브랜치를 따서 작업합니다.

### Directory Structure

> Last Update (24.03.24)

FSD(Frontend Structure Design) 아키텍쳐를 기반으로 작업합니다.
<br />
상세 내용은 [FSD 문서]("./FSD.md")를 참고해주세요.

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
