import { mergeDeep } from './merge-deep';

describe('mergeDeep', () => {
  const checkers: MergeTestGroup[] = [
    {
      testName: '간단한 overwrite 케이스',
      initial: { a: { a: [1, 2] } },
      overrides: [{ a: { a: 'a' } }],
      expected: { a: { a: 'a' } },
    },
    {
      testName: '간단한 merge 케이스',
      initial: { a: { a: 'a', b: 'b' } },
      overrides: [{ a: { c: 'c' } }, { c: 123 }],
      expected: { a: { a: 'a', b: 'b', c: 'c' }, c: 123 },
    },
    {
      testName: 'undefined인 경우 덮어써야 하지만, not defined일 경우엔 덮어쓰지 않아야 함',
      initial: { a: { a: 'willOverwrite', b: 'willKeep' } },
      overrides: [{ a: { a: undefined } }],
      expected: { a: { a: undefined, b: 'willKeep' } },
    },
  ];

  test.each(addCustomToStringEachChecker(checkers))('%s', ({ initial, overrides, expected }) => {
    const result = mergeDeep(initial, ...overrides);

    expect(result).toStrictEqual(expected);
  });

  test('source에만 있는 key 유지', () => {
    const result = mergeDeep({ a: 1, b: 2 }, { a: 10 });

    expect(result).toStrictEqual({ a: 10, b: 2 });
  });

  test('override에만 있는 key 추가', () => {
    const result = mergeDeep({ a: 1 }, { b: 2 } as Record<string, unknown>);

    expect(result).toStrictEqual({ a: 1, b: 2 });
  });

  test('배열은 merge하지 않고 교체', () => {
    const result = mergeDeep({ items: [1, 2, 3] }, { items: [4, 5] });

    expect(result).toStrictEqual({ items: [4, 5] });
  });

  test('원본 mutation 없음 (immutability)', () => {
    const initial = { a: { nested: 1 }, b: 2 };
    const override = { a: { nested: 99 } };
    const initialCopy = JSON.parse(JSON.stringify(initial));

    mergeDeep(initial, override);

    expect(initial).toStrictEqual(initialCopy);
  });
});

type MergeTestGroup = {
  testName: string;
  initial: Record<string, unknown>;
  overrides: Record<string, unknown>[];
  expected: Record<string, unknown>;
};

function addCustomToStringEachChecker(arr: MergeTestGroup[]) {
  return arr.map((v) => ({
    ...v,
    toString() {
      return this.testName;
    },
  }));
}
