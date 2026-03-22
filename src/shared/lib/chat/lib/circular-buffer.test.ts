import CircularBuffer from './circular-buffer';

describe('CircularBuffer', () => {
  test('초기화 시 올바른 값으로 초기화되어야 한다', () => {
    const buffer = new CircularBuffer([1, 2, 3], 5);
    expect(buffer.list).toEqual([1, 2, 3]);
  });

  test('초기 버퍼 길이가 최대 길이를 초과하면 오류를 발생시켜야 한다', () => {
    expect(() => new CircularBuffer([1, 2, 3, 4, 5, 6], 5)).toThrow(
      'Initial buffer length cannot exceed max length'
    );
  });

  test('버퍼에 값을 추가 시, 버퍼 length가 정해둔 max를 넘어가면 오래된 값이 제거되어야 한다', () => {
    const buffer = new CircularBuffer<number>([], 3);

    buffer.append(1);
    expect(buffer.list).toEqual([1]);

    buffer.append(2);
    expect(buffer.list).toEqual([1, 2]);

    buffer.append(3);
    expect(buffer.list).toEqual([1, 2, 3]);

    buffer.append(4);
    expect(buffer.list).toEqual([2, 3, 4]); // 오버플로우 발생, 1 제거

    buffer.append(5);
    expect(buffer.list).toEqual([3, 4, 5]); // 오버플로우 발생, 2 제거
  });
});
