import { ComponentProps } from 'react';

interface TagWrapTarget<Tag extends keyof JSX.IntrinsicElements> {
  targetPhrase: string;
  tag: Tag;
  tagAttr?: ComponentProps<Tag>;
}

export function wrapByTag<
  T1 extends keyof JSX.IntrinsicElements,
  T2 extends keyof JSX.IntrinsicElements,
  T3 extends keyof JSX.IntrinsicElements
>(fullPhrase: string, targets: [TagWrapTarget<T1>, TagWrapTarget<T2>, TagWrapTarget<T3>]): string;
export function wrapByTag<
  T1 extends keyof JSX.IntrinsicElements,
  T2 extends keyof JSX.IntrinsicElements
>(fullPhrase: string, targets: [TagWrapTarget<T1>, TagWrapTarget<T2>]): string;
export function wrapByTag<T1 extends keyof JSX.IntrinsicElements>(
  fullPhrase: string,
  targets: [TagWrapTarget<T1>]
): string;
export function wrapByTag<T1 extends keyof JSX.IntrinsicElements>(
  fullPhrase: string,
  targets: TagWrapTarget<T1>[]
): string;
export function wrapByTag<T extends keyof JSX.IntrinsicElements>(
  fullPhrase: string,
  targets: TagWrapTarget<T>[]
): string {
  return targets.reduce((result, { targetPhrase, tag, tagAttr }) => {
    const attrs = Object.entries(tagAttr ?? {}).reduce(
      (acc, [key, value]) => `${acc} ${key}="${value}"`,
      ''
    );
    const wrapped = `<${tag}${attrs}>${targetPhrase}</${tag}>`;
    return result.replace(targetPhrase, wrapped);
  }, fullPhrase);
}
