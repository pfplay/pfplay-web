import type { Mock as VitestMock, Mocked as VitestMocked } from 'vitest';

declare global {
  type Mock<T extends (...args: any[]) => any = (...args: any[]) => any> = VitestMock<T>;
  type Mocked<T> = VitestMocked<T>;
}
