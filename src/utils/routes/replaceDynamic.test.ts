import { replaceDynamic } from './replaceDynamic';

describe('replaceDynamic 함수', () => {
  test('주어진 path 의 dynamic token 을 params 의 key 가 매칭되는 value 로 교체해야 한다.', () => {
    const path = '/users/[userId]/orders/[orderId]';
    const params = { userId: 1, orderId: 123 };

    const result = replaceDynamic(path, params);

    expect(result).toBe('/users/1/orders/123');
  });

  test('문자열과 숫자 파라미터 값 모두를 다룰 수 있어야 한다.', () => {
    const path = '/users/[userId]/orders/[orderId]';
    const params = { userId: 'user', orderId: 123 };

    const result = replaceDynamic(path, params);

    expect(result).toBe('/users/user/orders/123');
  });

  test('매치되지 않는 params 는 교체되지 않아야 한다.', () => {
    const path = '/users/[userId]/orders';
    const params = { userId: 1, orderId: 123 };

    const result = replaceDynamic(path, params);

    expect(result).toBe('/users/1/orders');
  });
});
