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
