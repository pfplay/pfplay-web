# Trans

텍스트 번역과 동시에 여러 서식을 처리하기 위한 모듈입니다.

processer는 텍스트를 받아 html string을 return 하는 함수를 지칭합니다.
여러 개의 processer를 거쳐 반환된 html string을 react node로 내부에서 안전하게 변환하여 렌더링합니다.

## Processor

default - `[new LineBreakProcessor()]`

### 1. 줄바꿈 처리 (LineBreakProcessor)

`"\n"`을 `<br />`로 변환합니다.

```jsx
<Trans i18nKey='error.message' processors={[new LineBreakProcessor()]} />

// 원본 텍스트: "오류가 발생했습니다.\n다시 시도해주세요."
// 결과: "오류가 발생했습니다.<br />다시 시도해주세요."
```

### 2. Bold 처리 (BoldProcessor)

`**`로 감싼 텍스트를 `<b className="text-red-300">...</b>`로 변환합니다.

```jsx
<Trans i18nKey='welcome.message' processors={[new BoldProcessor()]} />

// 원본 텍스트: "**PFPlay**에 오신 것을 환영합니다."
// 결과: "<b className="text-red-300">PFPlay</b>에 오신 것을 환영합니다."
```

### 3. 변수 처리 (VariableProcessor)

`$1`, `$2`, ... 로 표시된 변수를 주어진 값으로 치환합니다.

```jsx
<Trans
  i18nKey='greeting'
  processors={[
    new LineBreakProcessor(),
    new VariableProcessor({
      $1: username,
      $2: <a href='/dashboard'>대시보드</a>,
    }),
  ]}
/>

// 원본 텍스트: "안녕하세요, $1님!\n$2로 이동하세요."
// 결과: "안녕하세요, 홍길동님!<br /><a href="/dashboard">대시보드</a>로 이동하세요."
```

### 4. 컴포넌트로 감싸기

```jsx
<Trans i18nKey='terms.policy' component={(content) => <Text variant='body2'>{content}</Text>} />

// 결과: <div class="terms-box">[번역된 콘텐츠]</div>
```

## 실제 사용 예제

```jsx
// 채팅 금지 메시지
<Trans
  i18nKey="party.para.penalty_chat_ban"
  processors={[
    new LineBreakProcessor(),
    new VariableProcessor({ '$1': banSeconds })
  ]}
/>

// 영구 퇴출 메시지
<Trans i18nKey="party.para.penalty_permanent_expulsion" />
```

## 엑셀 시트에 번역 추가 전 임시 번역 사용하기

`props.i18nKey`는 엑셀 시트로부터 빌드된 json의 nested key를 주입해야 합니다.
엑셀 시트에 번역이 추가되기 전에 개발 단계에서 이 컴포넌트를 사용하려면,
`__dev__preTranslation.ts`파일에 임시 번역을 추가해주세요.
