import { ReactNode } from 'react';

/**
 * react node를 텍스트로 변환합니다.
 * @see https://stackoverflow.com/a/60564620
 */
export function getNodeText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') {
    return '';
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return node.toString();
  }

  if (typeof node === 'object') {
    if (Array.isArray(node)) {
      return node.map(getNodeText).join('');
    }
    if ('props' in node) {
      return getNodeText(node.props.children);
    }
  }

  // console.warn('Unresolved `node` of type:', typeof node, node);
  return '';
}
