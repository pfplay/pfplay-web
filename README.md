# pfplay-web

### Web Directory Structure

> Last Update (23.07.02)

- `public` : nextjs에서 절대경로로 접근할 수 있는 assets을 저장하는 폴더
  - `icons` : 아이콘 컴포넌트로 사용될 svg 파일의 모음
  - `images` : 이미지로 사용될 파일의 모음
  - `logos` : 로고 아이콘
- `src`
  - `app` : Routing되는 Page의 단위가 되는 컴포넌트의 모음
  - `components`
    - `_features`: 각 라우터에 종속된 컴포넌트
    - `ui`: 공통 아토믹 컴포넌트
    - `*.tsx`: 공통 컴포넌트
  - `config` : component나 helper function에서 사용되는 configuration 파일 모음. e.g) routes.ts
  - `styles` : 공통으로 사용되는 style 관련 파일의 모음 (theme, global css, reset css 등)
  - `hooks` : 공통 hooks 모음
  - `lib`: 공통으로 사용되는 유틸 함수, helper 함수 모음
  - `types`: 공통 types 모음

### Web 기술 스택

> Last Update (23.07.02)

`NextJS, Typescript, TailwindCSS, HeadlessUI, React-query, Recoil, zod`

### Color Theme

> Last Update (230219)

- `tailwind.config.js`에 피그마 파일의 `Component/Color` 섹션 기준으로 컬러 테마 업데이트함
- `bg-red-200`, `text-gray-200`, `border-gray-500` 과 같은 형태로 사용 가능
- [vscode Tailwind CSS extensions](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) 사용시 자동완성 지원

### Images

> Last Update (230219)

- 아이콘: `/public/icons/*`
- 로고: `/public/logos/*`
- 일반 이미지: `/public/image/*`

### 프로젝트 세팅 방법

> Last Update (230226)

- 노션 문서 중 [프론트엔드 환경변수](https://www.notion.so/pfplay/3ad552e5b35845c492146605159cc418?pvs=4)를 참고해서 `.env`파일 추가하기
  ```
  $ cat .env.sample .env.local
  ```
- yarn 명령어로 패키지 설치하기
  ```
  $ yarn
  ```

### Work Process

> Last Update (230226)

1. 노션 문서의 로드맵 확인하기
2. 본인이 작업할 사항 로드맵에 추가하기
3. Task Board에 에픽에 맞게 로드맵에 추가한 작업할 사항 추가하기
4. develop 브런치에서 feature/FE 브런치 따서 작업하기
5. 디자인은 [피그마 파일](https://www.figma.com/file/PrQd76USwYaa2gQ2uN2yyZ/PFPlay-GUI?node-id=1%3A10) 참고하기
6. PR 및 브랜치 전략은 [노션문서](https://www.notion.so/pfplay/Git-43050745466b4f749421de4cab55f831?pvs=4) 참고하기
7. 커밋은 `git-cz` 사용하기
   ```shell
   $ git add <커밋할 파일>
   $ npx git-cz
   ```

### Color Theme

> Last Update (230726)

- `tailwind.config.js`에 피그마 파일의 `Design System` pages 기준으로 컬러 테마 업데이트함
- `bg-red-100`, `text-gray-100`, `border-gray-100` 과 같은 형태로 사용 가능
- [figma design system](https://www.figma.com/file/9I5PR6OqN8cHJ7WVTOKe00/PFPlay-GUI-%EC%84%A4%EA%B3%84%EC%84%9C-%ED%95%A9%EB%B3%B8?type=design&node-id=1-17&mode=design&t=QqCaaHhIdHcQ4KoN-0)
