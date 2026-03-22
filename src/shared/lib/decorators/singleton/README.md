# Singleton Decorator

클래스가 싱글톤으로 동작하도록 하는 데코레이터입니다.

```tsx
import { Singleton } from '@shared/lib/decorators/singleton';

@Singleton
class User {
  constructor(private name: string) {}

  public sayName() {
    console.log(`My name is ${this.name}`);
  }
}

// ...

let user = new User('Bob');
let secondUser = new User('not Bob'); // appear warning about initiate twice

user.sayName(); // "My name is Bob"
secondUser.sayName(); // still "My name is Bob"
```
