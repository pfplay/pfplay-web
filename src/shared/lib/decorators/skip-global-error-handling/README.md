# SkipGlobalErrorHandling Decorator

전역 에러 핸들러에서 특정 에러를 무시할 수 있도록 플래그를 설정하는 데코레이터입니다.

아래와 같이 사용합니다.

### 1. 글로벌 에러 헨들러에서 무시할 수 있도록 데코레이터 사용하여 플래그 추가

```tsx
import { SkipGlobalErrorHandling } from '@/shared/lib/decorators/skip-global-error-handling';
import { getErrorCode } from '@/shared/api/http/error/get-error-code';
import { ErrorCode } from '@/shared/api/http/types/@shared';

class UsersService {
  @SkipGlobalErrorHandling({
    when: (error) => getErrorCode(error) === ErrorCode.InvalidCredentials,
  })
  public login(credentials: Credentials) {
    // ...
  }
}
```

### 2. 글로벌 에러 헨들러에서 무시

```tsx
// ...
import { shouldSkipGlobalErrorHandling } from '@/shared/lib/decorators/skip-global-error-handling';

function handleBubbledError(error: unknown) {
  if (shouldSkipGlobalErrorHandling(error)) {
    return;
  }
  openErrorDialog(error);
}
```

### 3. 예외 처리한 에러에 대해 특정 페이지에서 원하는 동작 수행

참고 - 아래 예제의 `errorEmitter`는 발생하는 모든 api 에러에 대해서 `errorCode`를 emit하고, 이를 구독하여 특정 에러에 대한 동작을 수행할 수 있도록 하는 객체입니다.

```tsx
// ...
import { useEffect } from 'react';
import errorEmitter from '@/shared/api/http/error/error-emitter';
import { ErrorCode } from '@/shared/api/http/types/@shared';

// ...
const getUserInfo = () => {
  return usersService.getInfo(/* ... */);
};

useEffect(() => {
  const off = errorEmitter.on(ErrorCode.InvalidCredentials, () => {
    setErrorMessage(t.messages.invalidCredentials);
  });

  return off;
}, []);
```
