import { categorize, Categorized } from './categorize';

describe('categorize', () => {
  interface TestItem {
    id: number;
    category: string;
    name: string;
  }

  const testItems: TestItem[] = [
    { id: 1, category: 'A', name: 'Item 1' },
    { id: 2, category: 'B', name: 'Item 2' },
    { id: 3, category: 'A', name: 'Item 3' },
    { id: 4, category: 'C', name: 'Item 4' },
    { id: 5, category: 'B', name: 'Item 5' },
  ];

  test('기본 카테고리화 테스트', () => {
    const result = categorize({
      items: testItems,
      categoryKey: 'category',
    });

    const expected: Categorized<TestItem> = {
      A: [
        { id: 1, category: 'A', name: 'Item 1' },
        { id: 3, category: 'A', name: 'Item 3' },
      ],
      B: [
        { id: 2, category: 'B', name: 'Item 2' },
        { id: 5, category: 'B', name: 'Item 5' },
      ],
      C: [{ id: 4, category: 'C', name: 'Item 4' }],
    };

    expect(result).toEqual(expected);
  });

  test('사용자 정의 getCategoryValue parameter 테스트', () => {
    const result = categorize({
      items: testItems,
      categoryKey: 'category',
      getCategoryValue: (item) => item.category.toLowerCase(),
    });

    const expected: Categorized<TestItem> = {
      a: [
        { id: 1, category: 'A', name: 'Item 1' },
        { id: 3, category: 'A', name: 'Item 3' },
      ],
      b: [
        { id: 2, category: 'B', name: 'Item 2' },
        { id: 5, category: 'B', name: 'Item 5' },
      ],
      c: [{ id: 4, category: 'C', name: 'Item 4' }],
    };

    expect(result).toEqual(expected);
  });

  test('orderReferenceArr parameter 테스트', () => {
    const result = categorize({
      items: testItems,
      categoryKey: 'category',
      orderReferenceArr: ['C', 'B', 'A'],
    });

    const expectedKeysOrder = ['C', 'B', 'A'];
    const wrongKeysOrder = ['A', 'B', 'C'];
    expect(Object.keys(result)).toEqual(expectedKeysOrder);
    expect(Object.keys(result)).not.toEqual(wrongKeysOrder);
  });

  test('빈 배열 입력 테스트', () => {
    const result = categorize({
      items: [],
      categoryKey: 'category',
    });

    expect(result).toEqual({});
  });

  test('orderReferenceArr에 items에 존재하지 않는 카테고리가 있을 경우 테스트', () => {
    const result = categorize({
      items: testItems,
      categoryKey: 'category',
      orderReferenceArr: ['A', 'B', 'C', 'D'],
    });

    expect(result).not.toHaveProperty('D');
    expect(Object.keys(result)).toEqual(['A', 'B', 'C']);
  });
});
