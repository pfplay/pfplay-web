# Mock decorators

클래스 인스턴스 메서드가 지정한 mock value를 return 하도록 만들어줍니다.
로컬 개발 환경에서 특정 응답값을 받아야 할 때 또는 API가 아직 완성되지 않았을 때 사용할 수 있습니다.
`@MockResolve`는 promise를 반환하는 메서드에 사용하고, `@MockReturn`은 일반 메서드에 사용합니다.

데코레이터는 `process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK === 'true'`일 때만 동작하며,
그 외엔 데코레이터가 적용되어 있어도 무시됩니다.

## `@MockResolve`

### 성공 케이스

```ts
import { MockResolve } from '@shared/lib/decorators/mock';
import { fixturePosts } from '~~/posts.fixture';

class PostsService {
  @MockResolve({ data: fixturePosts }) // always return fixturePosts
  public static async getMyPosts() {
    return /* ... */;
  }
}
```

### 에러 케이스

```ts
import { MockResolve } from '@shared/lib/decorators/mock';

class PostsService {
  @MockResolve({ error: new Error('Oops') }) // always throw error
  public static async getMyPosts() {
    return /* ... */;
  }
}
```

## `@MockReturn`

### 성공 케이스

```ts
import { MockReturn } from '@shared/lib/decorators/mock';

class Calculator {
  @MockReturn({ data: 10 }) // always return 10
  public static sum(a: number, b: number) {
    return a + b;
  }
}
```

### 에러 케이스

```ts
import { MockReturn } from '@shared/lib/decorators/mock';

class Calculator {
  @MockReturn({ error: new Error('Invalid number') }) // always throw error
  public static sum(a: number, b: number) {
    return a + b;
  }
}
```
