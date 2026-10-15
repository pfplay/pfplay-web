import type TReactPlayer from 'react-player';

const CAPTIONS_RETRY_DELAY_MS = 1500;

export function disableYoutubeCaptions(player: TReactPlayer | null): void {
  const iframe = (
    player?.getInternalPlayer() as { getIframe?: () => HTMLIFrameElement } | null
  )?.getIframe?.();

  if (!iframe?.contentWindow) return;

  const unloadCaptions = () =>
    iframe.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: 'unloadModule', args: ['captions'] }),
      'https://www.youtube.com'
    );

  unloadCaptions();
  setTimeout(unloadCaptions, CAPTIONS_RETRY_DELAY_MS);
}
