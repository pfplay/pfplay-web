// @reference https://github.com/ant-design/ant-design/blob/master/components/modal/confirm.tsx

import { render as reactRender, unmount as reactUnmount } from '@/shared/lib/react/render';

import Dialog, { type DialogProps } from './dialog.component';

type DialogStaticOpenParams = Omit<DialogProps, 'open'>;

const destroyFns: Array<() => void> = [];

export default function open(params: DialogStaticOpenParams): { destroy: () => void } {
  const container = document.createDocumentFragment();

  const props: DialogProps = {
    ...params,
    open: true,
  };

  let renderTimeoutId: ReturnType<typeof setTimeout>;
  let destroyTimeoutId: ReturnType<typeof setTimeout>;

  function destroy() {
    for (let i = 0; i < destroyFns.length; i++) {
      const fn = destroyFns[i];

      if (fn === close) {
        destroyFns.splice(i, 1);
        break;
      }
    }

    reactUnmount(container);
  }

  function render(props: DialogProps) {
    clearTimeout(renderTimeoutId);

    /**
     * https://github.com/ant-design/ant-design/issues/23623
     *
     * Sync render blocks React event. Let's make this async.
     */
    renderTimeoutId = setTimeout(() => {
      // const theme = ~~.getTheme(); // NOTE - global.getTheme 등이 있다면 여기서 얻어와서 아래 넣어주기

      reactRender(<Dialog {...props} />, container); // NOTE: theme provider 있으면 감싸기
    });
  }

  function close() {
    render({
      ...props,
      open: false,
    });

    clearTimeout(destroyTimeoutId);
    setTimeout(() => {
      destroy();
    }, 200); // NOTE: dialog leave animation duration
  }

  render(props);

  destroyFns.push(close);

  return {
    destroy: close,
  };
}

export function destroyAll() {
  destroyFns.forEach((fn) => fn());
}
