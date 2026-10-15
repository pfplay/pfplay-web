import type TReactPlayer from 'react-player';
import { disableYoutubeCaptions } from './disable-captions';

describe('disableYoutubeCaptions', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  test('YouTube iframe에 captions unload 명령을 보낸다', () => {
    const postMessage = vi.fn();
    const iframe = {
      src: 'https://www.youtube.com/embed/video-id',
      contentWindow: { postMessage },
    } as unknown as HTMLIFrameElement;
    const player = {
      getInternalPlayer: () => ({ getIframe: () => iframe }),
    } as unknown as TReactPlayer;

    disableYoutubeCaptions(player);

    expect(postMessage).toHaveBeenCalledWith(
      JSON.stringify({ event: 'command', func: 'unloadModule', args: ['captions'] }),
      'https://www.youtube.com'
    );
  });

  test('YouTube가 자막 모듈을 늦게 올릴 때를 위해 다시 명령을 보낸다', () => {
    const postMessage = vi.fn();
    const iframe = {
      src: 'https://www.youtube.com/embed/video-id',
      contentWindow: { postMessage },
    } as unknown as HTMLIFrameElement;
    const player = {
      getInternalPlayer: () => ({ getIframe: () => iframe }),
    } as unknown as TReactPlayer;

    disableYoutubeCaptions(player);
    expect(postMessage).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1500);

    expect(postMessage).toHaveBeenCalledTimes(2);
  });
});
