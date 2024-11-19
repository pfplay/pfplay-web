// @reference https://github.com/react-component/util/blob/master/src/React/render.ts

import type { ReactElement } from 'react';
import * as ReactDOM from 'react-dom';
import type { Root } from 'react-dom/client';

// Let compiler not to search module usage
const clonedReactDOM = {
  ...ReactDOM,
} as typeof ReactDOM & {
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?: {
    usingClientEntryPoint?: boolean;
  };
  createRoot?: CreateRoot;
};

type CreateRoot = (container: ContainerType) => Root;

const { version, render: reactRender, unmountComponentAtNode } = clonedReactDOM;

let createRoot: CreateRoot | undefined;
try {
  const mainVersion = Number((version || '').split('.')[0]);
  if (mainVersion >= 18) {
    createRoot = clonedReactDOM.createRoot;
  }
} catch (e) {
  // Do nothing;
}

function toggleReactDOMWarning(skip: boolean) {
  const { __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } = clonedReactDOM;

  if (
    __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED &&
    typeof __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED === 'object'
  ) {
    __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.usingClientEntryPoint = skip;
  }
}

const MARK = '__qfc_react_root__';

// ========================== Render ==========================
type ContainerType = (Element | DocumentFragment) & {
  [MARK]?: Root;
};

function modernRender(node: ReactElement, container: ContainerType) {
  if (!createRoot) return;

  toggleReactDOMWarning(true);
  const root = container[MARK] || createRoot(container);
  toggleReactDOMWarning(false);

  root.render(node);

  container[MARK] = root;
}

function legacyRender(node: ReactElement, container: ContainerType) {
  reactRender(node, container);
}

export function render(node: ReactElement, container: ContainerType) {
  if (createRoot) {
    modernRender(node, container);
    return;
  }

  legacyRender(node, container);
}

// ========================= Unmount ==========================
async function modernUnmount(container: ContainerType) {
  // Delay to unmount to avoid React 18 sync warning
  return Promise.resolve().then(() => {
    container[MARK]?.unmount();

    delete container[MARK];

    return;
  });
}

function legacyUnmount(container: ContainerType) {
  unmountComponentAtNode(container);
}

export async function unmount(container: ContainerType) {
  if (createRoot !== undefined) {
    // Delay to unmount to avoid React 18 sync warning
    return modernUnmount(container);
  }

  legacyUnmount(container);
}
