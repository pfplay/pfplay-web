# pfplay-web

### Web Directory Structure

> Last Update (221020)

- `public` : nextjs에서 절대경로로 접근할 수 있는 assets을 저장하는 폴더
  - `icons` : 아이콘 컴포넌트로 사용될 svg 파일의 모음
  - `images` : 이미지로 사용될 파일의 모음
- `src`
  - `components`
    - `ui`: 공통 디자인 컴포넌트의 모음
  - `pages` : routing되는 Page의 단위가 되는 컴포넌트의 모음
  - `core`
    - `store` : recoil에서 사용하는 atom 및 selector를 저장한 파일의 모음
    - `query` : react-query 및 api 코드를 정의한 파일의 모음
  - `shared` : 공통으로 사용되는 변수(const 등) 파일의 모음
  - `styles` : 공통으로 사용되는 style 관련 파일의 모음 (theme, global css, reset css 등)
  - `utils`: 공통으로 사용되는 유틸 함수 모음
    - `hooks` : 공통 hooks 모음
  - `types`: 공통 types 모음

### Web 기술 스택

> Last Update (221020)

`NextJS, Typescript, TailwindCSS, React-query, Recoil`

### Color Theme

> Last Update (230219)

- `tailwind.config.js`에 피그마 파일의 `Component/Color` 섹션 기준으로 컬러 테마 업데이트함
- `bg-red500`, `text-gray100`, `border-gray50` 과 같은 형태로 사용 가능
- [vscode Tailwind CSS extensions](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) 사용시 자동완성 지원

### Images

> Last Update (230219)

- 아이콘: `/public/icons/*`
- 로고: `/public/logos/*`
- 일반 이미지: `/public/image/*`
