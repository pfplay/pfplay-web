import type { ReactNode } from 'react';
import { getNodeText } from './get-node-text';

describe('getNodeText', () => {
  test('노드가 null일 때 빈 문자열을 반환해야 한다.', () => {
    const node: ReactNode = null;

    const result = getNodeText(node);

    expect(result).toBe('');
  });

  test('노드가 문자열일 때 문자열을 반환해야 한다.', () => {
    const node: ReactNode = 'string';

    const result = getNodeText(node);

    expect(result).toBe(node);
  });

  test('노드가 숫자일 때 문자열을 반환해야 한다.', () => {
    const node: ReactNode = 123;

    const result = getNodeText(node);

    expect(result).toBe(node.toString());
  });

  test('노드가 불리언일 때 빈 문자열을 반환해야 한다.', () => {
    const node: ReactNode = true;

    const result = getNodeText(node);

    expect(result).toBe('');
  });

  test('노드가 객체일 때 텍스트를 반환해야 한다.', () => {
    const node: ReactNode = getReactNodeLike('text');

    const result = getNodeText(node);

    expect(result).toBe('text');
  });

  test('노드가 객체이고 props.children이 null일 때 빈 문자열을 반환해야 한다.', () => {
    const node: ReactNode = getReactNodeLike(null);

    const result = getNodeText(node);

    expect(result).toBe('');
  });

  test('노드가 객체이고 props.children이 undefined일 때 빈 문자열을 반환해야 한다.', () => {
    const node: ReactNode = getReactNodeLike(undefined);

    const result = getNodeText(node);

    expect(result).toBe('');
  });

  test('노드가 객체이고 props.children이 빈 문자열일 때 빈 문자열을 반환해야 한다.', () => {
    const node: ReactNode = getReactNodeLike('');

    const result = getNodeText(node);

    expect(result).toBe('');
  });

  test('노드가 객체이고 props.children이 빈 배열일 때 빈 문자열을 반환해야 한다.', () => {
    const node: ReactNode = getReactNodeLike([]);

    const result = getNodeText(node);

    expect(result).toBe('');
  });
});

function getReactNodeLike(children: ReactNode) {
  return {
    props: {
      children,
    },
  } as ReactNode;
}
