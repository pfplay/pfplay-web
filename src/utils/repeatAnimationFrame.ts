export const repeatAnimationFrame = (callback: (...args: unknown[]) => unknown, repeat: number) => {
  if (repeat <= 0) {
    callback();
    return;
  }

  requestAnimationFrame(() => {
    repeatAnimationFrame(callback, repeat - 1);
  });
};
