'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type TReactPlayer from 'react-player';
import { YouTubeConfig } from 'react-player/youtube';

type Props = {
  width: number;
};

const TEMP_VIDEO_ID = '11cta61wi0g';

const YoutubePlayer = dynamic(() => import('react-player/youtube'), { ssr: false });

export default function Video({ width }: Props) {
  const [player, setPlayer] = useState<TReactPlayer>();
  const height = getHFromW(width);

  useEffect(() => {
    if (player) {
      player.forceUpdate();
    }
  }, [player]);

  return (
    <YoutubePlayer
      playing
      width={width}
      height={height}
      url={`https://www.youtube.com/watch?v=${TEMP_VIDEO_ID}`}
      config={config}
      className='bg-black border border-gray-800 rounded select-none'
      onReady={setPlayer}
    />
  );
}

function getHFromW(width: number) {
  return width * (288 / 512);
}

const config: YouTubeConfig = {
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
    playlist: `${TEMP_VIDEO_ID}`, // for loop
  },
};
