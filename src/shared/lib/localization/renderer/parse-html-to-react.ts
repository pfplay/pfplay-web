import {
  isValidElement,
  cloneElement,
  createElement,
  Children,
  ReactNode,
  ReactElement,
  ComponentType,
} from 'react';
import HTML from 'html-parse-stringify';
import { isPlainObject } from '@/shared/lib/functions/is-plain-object';

// 타입
type ASTNode = {
  type: 'tag' | 'text';
  name?: string;
  attrs?: Record<string, string>;
  children?: ASTNode[];
  content?: string;
  voidElement?: boolean;
};

type HtmlToReactOptions = {
  keepBasicHtmlNodesFor?: string[];
  wrapTextNodes?: string | ComponentType<any>;
};

interface DummyNode {
  dummy: boolean;
  children: ReactNode;
  props?: Record<string, any>;
}

// 유틸리티 함수
const isDummyNode = (v: unknown) => isPlainObject(v) && 'dummy' in v && v.dummy;

const hasChildren = (
  node: ReactElement | DummyNode | null | undefined,
  checkLength?: boolean
): boolean => {
  if (!node) return false;
  const base = node.props?.children ?? (node as DummyNode).children;
  if (checkLength) return Array.isArray(base) ? base.length > 0 : !!base;
  return !!base;
};

const getChildren = (node: ReactElement | DummyNode | null | undefined): ReactNode => {
  if (!node) return [];
  return node.props?.children ?? (node as DummyNode).children;
};

const hasValidReactChildren = (children: ReactNode): boolean =>
  Array.isArray(children) && children.every(isValidElement);

const getAsArray = <T>(data: T | T[]): T[] => (Array.isArray(data) ? data : [data]);

const mergeProps = (source: { props: Record<string, any> }, target: any): any => {
  const newTarget = { ...target };
  // target.props가 이미 설정되어 있을 때 source.props를 덮어씁니다
  newTarget.props = Object.assign(source.props, target.props || {});
  return newTarget;
};

/**
 * HTML 문자열을 React 노드로 변환합니다
 * @param htmlString - 파싱할 HTML 문자열
 * @param rootChildren - HTML 태그에 매핑할 선택적 React 자식 요소
 * @param options - 설정 옵션
 * @returns React 요소 배열
 */
export default function parseHtmlToReact(
  htmlString: string,
  rootChildren: ReactNode = [],
  options: HtmlToReactOptions = {}
): ReactNode[] {
  if (htmlString === '') return [];

  const keepArray = options.keepBasicHtmlNodesFor || [];
  const wrapTextNodes = options.wrapTextNodes;

  // HTML 문자열에서 React 노드로 대체해야 할 태그가 포함되어 있는지 확인합니다
  const emptyChildrenButNeedsHandling =
    htmlString && new RegExp(keepArray.map((keep) => `<${keep}`).join('|')).test(htmlString);

  // 대상 문자열에서 태그를 대체할 필요가 없습니다
  if (!rootChildren && !emptyChildrenButNeedsHandling) return [htmlString];

  // 추가 래퍼 태그가 있는 문자열에서 AST를 파싱합니다
  // -> 파서에서 텍스트 노드를 제거하는 문제를 방지합니다
  const ast = HTML.parse(`<0>${htmlString}</0>`) as ASTNode[];

  const renderInner = (
    child: ReactElement | DummyNode,
    node: ASTNode,
    rootReactNode: ReactNode[]
  ): ReactNode => {
    const childs = getChildren(child);
    const mappedChildren = mapAST(childs, node.children, rootReactNode);

    return hasValidReactChildren(childs) && mappedChildren.length === 0 ? childs : mappedChildren;
  };

  const pushTranslatedJSX = (
    child: ReactElement | DummyNode,
    inner: ReactNode,
    mem: ReactNode[],
    i: number,
    isVoid?: boolean
  ): void => {
    if ('dummy' in child && child.dummy) {
      (child as DummyNode).children = inner; // preact에서 필요합니다!
      mem.push(
        cloneElement(child as unknown as ReactElement, { key: i }, isVoid ? undefined : inner)
      );
    } else {
      mem.push(
        ...Children.map([child as ReactElement], (c) => {
          const props = { ...c.props };

          return createElement(
            c.type,
            {
              ...props,
              key: i,
              // @ts-expect-error - ref를 전달해야 합니다
              ref: c.ref,
            },
            isVoid ? null : inner
          );
        })
      );
    }
  };

  // reactNode (jsx 루트 요소 또는 자식)
  // astNode (HTML 문자열을 HTML AST로 변환한 것)
  // rootReactNode (가장 바깥쪽 jsx 자식 배열)
  const mapAST = (
    reactNode: ReactNode,
    astNode: ASTNode[] | undefined,
    rootReactNode: ReactNode[]
  ): ReactNode[] => {
    if (!astNode) return [];

    const reactNodes = getAsArray(reactNode);
    const astNodes = getAsArray(astNode);

    return astNodes.reduce<ReactNode[]>((mem, node, i) => {
      if (node.type === 'tag') {
        // 일반 배열 (컴포넌트 또는 자식)
        let tmp = reactNodes[parseInt(node.name || '0', 10)];

        // 객체 내에서 이름이 지정된 컴포넌트인 경우
        if (rootReactNode.length === 1 && !tmp && node.name && isPlainObject(rootReactNode[0])) {
          tmp = (rootReactNode[0] as Record<string, ReactNode>)[node.name];
        }

        // @ts-expect-error - 둘 다 아님
        if (!tmp) tmp = {};

        const child =
          node.attrs && Object.keys(node.attrs).length !== 0
            ? mergeProps({ props: node.attrs }, tmp)
            : tmp;

        const isElement = isValidElement(child);

        const isValidTranslationWithChildren =
          isElement && hasChildren(child as ReactElement, true) && !node.voidElement;

        const isEmptyTransWithHTML =
          emptyChildrenButNeedsHandling && isDummyNode(child) && child.dummy && !isElement;

        const isKnownComponent =
          isPlainObject(rootChildren) &&
          node.name &&
          Object.hasOwnProperty.call(rootChildren, node.name);

        if (typeof child === 'string') {
          mem.push(child);
        } else if (
          hasChildren(child as ReactElement | DummyNode) || // jsx 요소에 자식이 있음 -> 반복
          isValidTranslationWithChildren // 자식이 없는 유효한 jsx 요소이지만 HTML에는 자식이 있음 -> 반복
        ) {
          const inner = renderInner(child as ReactElement | DummyNode, node, rootReactNode);
          pushTranslatedJSX(child as ReactElement | DummyNode, inner, mem, i);
        } else if (isEmptyTransWithHTML) {
          // React 노드로 변환이 필요한 HTML 태그가 있는 대상 문자열이 포함된 빈 노드(더미 요소)가 있는 경우
          // 내부 내용만 매핑하면 됩니다
          const inner = mapAST(
            reactNodes /* 잘못되었지만 필요한 것 */,
            node.children,
            rootReactNode
          );
          pushTranslatedJSX(child as DummyNode, inner, mem, i);
        } else if (node.name && Number.isNaN(parseFloat(node.name))) {
          if (isKnownComponent) {
            const inner = renderInner(child as ReactElement | DummyNode, node, rootReactNode);
            pushTranslatedJSX(child as ReactElement | DummyNode, inner, mem, i, node.voidElement);
          } else if (keepArray.indexOf(node.name) > -1) {
            if (node.voidElement) {
              mem.push(createElement(node.name, { key: `${node.name}-${i}`, ...node.attrs }));
            } else {
              const inner = mapAST(
                reactNodes /* 잘못되었지만 필요한 것 */,
                node.children,
                rootReactNode
              );

              mem.push(
                createElement(node.name, { key: `${node.name}-${i}`, ...node.attrs }, inner)
              );
            }
          } else if (node.voidElement) {
            mem.push(`<${node.name} />`);
          } else {
            const inner = mapAST(
              reactNodes /* 잘못되었지만 필요한 것 */,
              node.children,
              rootReactNode
            );

            mem.push(`<${node.name}>${inner}</${node.name}>`);
          }
        } else {
          // 컴포넌트에 자식이 없지만 HTML에는 자식이 있는 경우
          pushTranslatedJSX(
            child as ReactElement | DummyNode,
            node.children?.[0]?.content,
            mem,
            i,
            !node.children || node.children.length !== 1 || !node.children[0]?.content
          );
        }
      } else if (node.type === 'text') {
        const content = node.content || '';
        if (wrapTextNodes) {
          mem.push(createElement(wrapTextNodes, { key: `${node.name}-${i}` }, content));
        } else {
          mem.push(content);
        }
      }
      return mem;
    }, []);
  };

  // HTML에서 문자열 AST에 대해 수행한 것처럼 추가 노드에 중첩된 React 노드로 mapAST를 호출합니다
  // 예상된 결과를 얻기 위해 해당 추가 노드의 자식을 반환합니다

  // @ts-expect-error - 더미를 전달해야 합니다
  const result = mapAST([{ dummy: true, children: rootChildren }], ast, getAsArray(rootChildren));

  return getChildren(result[0] as ReactElement | DummyNode) as ReactNode[];
}
