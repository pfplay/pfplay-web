import CircularBuffer from './circular-buffer';
import CircularBufferAdapter from './circular-buffer-adapter';

describe('CircularBufferAdapter', () => {
  let adapter: CircularBufferAdapter<string>;

  beforeEach(() => {
    adapter = new CircularBufferAdapter(new CircularBuffer<string>([], 10));
  });

  test('append → list에 반영된다', () => {
    adapter.append('hello');
    adapter.append('world');
    expect(adapter.list).toEqual(['hello', 'world']);
  });

  test('clear → list가 비어진다', () => {
    adapter.append('a');
    adapter.append('b');
    adapter.clear();
    expect(adapter.list).toEqual([]);
  });

  test('update → 조건에 맞는 항목을 변경하고 변경된 항목을 반환한다', () => {
    adapter.append('apple');
    adapter.append('banana');

    const result = adapter.update(
      (msg) => msg === 'apple',
      () => 'APPLE'
    );

    expect(result).toBe('APPLE');
    expect(adapter.list).toEqual(['APPLE', 'banana']);
  });

  test('update → 조건에 맞는 항목이 없으면 undefined를 반환한다', () => {
    adapter.append('apple');

    const result = adapter.update(
      (msg) => msg === 'cherry',
      () => 'CHERRY'
    );

    expect(result).toBeUndefined();
    expect(adapter.list).toEqual(['apple']);
  });
});
