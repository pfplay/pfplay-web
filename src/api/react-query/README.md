# react-query 컨벤션

### 개요

react-query-wrapper 는 react-query 의 추상화 레이어이다.

### 1. react query wrapper는 react query와 백엔드 서비스의 연동 레이어라는 단일 책임만 가지게 하며, 실제 api를 활용한 로직은 application service 로직을 구현할 hook 혹은 컴포넌트에서 처리한다.

```tsx
import useFetchA from '.../react-query/a';
import useFetchB from '.../react-query/b';
import useAwesomeBusinessLogic from '.../logic';

function useSomeFeature() {
  const a = useFetchA();
  const b = useFetchB();
  // api converting 등의 로직 수행
  const result = useAwesomeBusinessLogic(a, b);

  return result;
}

function SomeFeature() {
  const feature = useSomeFeature();

  return <SomeFeatureView {...feature} />;
}
```

### 2. react-query-wrapper 파일 네이밍 규칙은 아래와 같이 한다.

- query - `use[Entity]Query.ts`
  - `ex) usePostsQuery.ts`
  - `ex) usePostsInfiniteQuery.ts`
  - `ex) usePostsSuspenseQuery.ts`
- mutation - `use[Entity][Action]Mutation.ts`
  - `ex) usePostCreateMutation.ts`
  - `ex) usePostUpdateMutation.ts`

### 3. query 의 옵션을 잘 활용한다.

#### 3-1. staleTime과 gcTime을 항상 명시적으로 설정한다.

staleTime과 gcTime을 몇으로 설정할지에 대한 명확한 기준은 없으며, 각 API의 특성에 따라 적절한 값을 설정해야 한다.

- 값에 Infinity 를 설정할 땐 충분히 고민한다. (예를 들어, staleTime 에 Infinity 를 설정하면 데이터 갱신이 불가능해짐
- ⭐ _[공식문서의 설명](https://tanstack.com/query/latest/docs/react/guides/advanced-ssr)에 따라, 서버 측 렌더링 시에는 staleTime을 0이 아닌 값으로 설정해야 한다._
- etc..

#### 3-2. staleTime의 기본값이 5분이므로, refetchOnWindowFocus 옵션을 default true 로 놓되, 필요할 땐 적절히 활용한다.

외부의 요인, 사용자의 액션 등으로 계속해서 변경되어 캐시가 무의미한 데이터인 경우, refetchOnWindowFocus 옵션을 true 로 설정하여 적절한 시점에 데이터를 갱신할 수 있도록 한다.

### 4. 제네릭을 활용한다.

#### AS-IS

```ts
export const createPostMutation = () => {
  return useMutation({
    queryKey: [POST_QUERY_KEY],
    mutationFn: (payload: CreatePostPayload) => createPost(payload),
    ...
  });
}
...
const { mutate, error } = createPostMutation();
...
if ((error as APIError | null)?.errorCode === 401) { ... }
```

#### TO-BE

```ts
export const createPostMutation = () => {
  return useMutation<CreatePostResponse, APIError, CreatePostPayload>({
    queryKey: [POST_QUERY_KEY],
    mutationFn: createPost,
    ...
  });
}
const { mutate, error } = createPostMutation();
...
if (error?.errorCode === 401) { ... }
```
