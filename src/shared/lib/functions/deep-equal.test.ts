import { deepEqual } from './deep-equal';

type TestGroup = {
  testName: string;
  source: [Record<string, any>, Record<string, any>];
  expected: boolean;
};

const checkers: TestGroup[] = [
  {
    testName: 'object - normal true',
    source: [
      { a: 1, b: 2 },
      { a: 1, b: 2 },
    ],
    expected: true,
  },
  {
    testName: 'object - normal false',
    source: [
      { a: 1, b: 2 },
      { a: 1, b: 1 },
    ],
    expected: false,
  },
  {
    testName: 'object - different order of keys',
    source: [
      { a: 1, b: 2 },
      { b: 2, a: 1 },
    ],
    expected: true,
  },
  {
    testName: 'object - deep',
    source: [
      { a: 1, b: { a: 1, b: 2 } },
      { b: { a: 1, b: 2 }, a: 1 },
    ],
    expected: true,
  },
  {
    testName: 'array - normal',
    source: [
      [1, 2],
      [1, 2],
    ],
    expected: true,
  },
  {
    testName: 'array - different order of keys',
    source: [
      [1, 2],
      [2, 1],
    ],
    expected: false,
  },
  {
    testName: 'array - deep',
    source: [
      [1, [1, 2]],
      [1, [1, 2]],
    ],
    expected: true,
  },
  {
    testName: 'full',
    source: [
      {
        a: '1',
        b: [1, 2, { a: 1, b: 2, c: [1, [1, 2, { a: 1, b: 2 }]] }],
        c: null,
        d: { a: 1, b: [1, 2] },
      },
      {
        c: null,
        a: '1',
        d: { b: [1, 2], a: 1 },
        b: [1, 2, { a: 1, c: [1, [1, 2, { b: 2, a: 1 }]], b: 2 }],
      },
    ],
    expected: true,
  },
];

const addCustomToStringEachChecker = (arr: TestGroup[]) =>
  arr.map((v) => ({
    ...v,
    toString() {
      return this.testName;
    },
  }));

describe('deepEqual', () => {
  it.each(addCustomToStringEachChecker(checkers))('%s', ({ source, expected }) => {
    const result = deepEqual(source[0], source[1]);

    expect(result).toBe(expected);
  });
});
