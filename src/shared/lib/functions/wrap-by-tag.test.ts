import { wrapByTag } from '@/shared/lib/functions/wrap-by-tag';

describe('utils/wrapByTag', () => {
  test('기본 태그로 문자열 감싸기', () => {
    const result = wrapByTag('Hello, world!', [
      {
        targetPhrase: 'world',
        tag: 'strong',
      },
    ]);
    expect(result).toBe('Hello, <strong>world</strong>!');
  });

  test('한 가지 속성이 있는 태그로 문자열 감싸기', () => {
    const result = wrapByTag('Hello, world!', [
      {
        targetPhrase: 'world',
        tag: 'span',
        tagAttr: { className: 'highlight' },
      },
    ]);
    expect(result).toBe('Hello, <span className="highlight">world</span>!');
  });

  test('다중 속성을 가진 태그로 문자열 감싸기', () => {
    const result = wrapByTag('Hello, world!', [
      {
        targetPhrase: 'world',
        tag: 'span',
        tagAttr: { className: 'highlight', id: 'worldId' },
      },
    ]);
    expect(result).toBe('Hello, <span className="highlight" id="worldId">world</span>!');
  });

  test('목표 문자열이 없을 때 원본 문자열 반환', () => {
    const result = wrapByTag('Hello, world!', [
      {
        targetPhrase: 'Apple',
        tag: 'span',
      },
    ]);
    expect(result).toBe('Hello, world!');
  });

  test('여러 타겟으로 문자열 감싸기', () => {
    const result = wrapByTag('Hello, world!', [
      {
        targetPhrase: 'Hello',
        tag: 'strong',
      },
      {
        targetPhrase: 'world',
        tag: 'em',
        tagAttr: { className: 'highlight' },
      },
    ]);
    expect(result).toBe('<strong>Hello</strong>, <em className="highlight">world</em>!');
  });
});
