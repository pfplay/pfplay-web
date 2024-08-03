'use client';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import type TReactPlayer from 'react-player';
import type { YouTubeConfig } from 'react-player/youtube';
import { useStores } from '@/shared/lib/store/stores.context';

type Props = {
  width: number;
  height?: number;
};

const YoutubePlayer = dynamic(() => import('react-player/youtube'), { ssr: false });

export default function Video({ width, height = width * DEFAULT_H_RATIO }: Props) {
  const { useCurrentPartyroom } = useStores();
  const videoId = useCurrentPartyroom((state) => state.playback?.linkId);
  const [player, setPlayer] = useState<TReactPlayer>();

  const config = useMemo(() => {
    if (!videoId) return;

    return getConfig(videoId);
  }, [videoId]);

  useEffect(() => {
    if (!player) return;

    player.forceUpdate();
  }, [player, videoId]);

  if (!videoId) return null;
  return (
    <YoutubePlayer
      playing
      width={width}
      height={height}
      url={`https://www.youtube.com/watch?v=${videoId}`}
      config={config}
      className='bg-black border border-gray-800 rounded select-none'
      onReady={setPlayer}
    />
  );
}

const DEFAULT_H_RATIO = 288 / 512;

function getConfig(videoId: string): YouTubeConfig {
  return {
    playerVars: {
      // Hide controls
      controls: 1,
      // Modest branding
      modestbranding: 1,
      // Hide related videos at the end
      rel: 0,
      // Auto-hide controls
      autohide: 1,
      // Autoplay
      // autoplay: 1,
      // mute: 1, // for autoplay - https://github.com/cookpete/react-player?tab=readme-ov-file#autoplay
      // loop
      loop: 1,
      playlist: videoId, // for loop
    },
  };
}
