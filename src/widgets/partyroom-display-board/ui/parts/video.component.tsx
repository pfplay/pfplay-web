'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import type TReactPlayer from 'react-player';
import { YouTubeConfig } from 'react-player/youtube';
import { Playback } from '@/entities/current-partyroom';
import { PartyroomPlayback } from '@/shared/api/http/types/partyrooms';
import { cn } from '@/shared/lib/functions/cn';
import { pick } from '@/shared/lib/functions/pick';
import { useStores } from '@/shared/lib/store/stores.context';
import { LoadingPanel } from '@/shared/ui/components/loading';

const YoutubePlayer = dynamic(() => import('react-player/youtube'), { ssr: false });

type Props = {
  width: number;
  height?: number;
};

/**
 * TODO - Will
 *  chrome에선 사용자와의 상호작용이 없는 상태에서 muted가 아닌 비디오의 auto play가 불가능합니다.
 *  @see https://developer.chrome.com/blog/autoplay?hl=ko
 *  @see https://stackoverflow.com/questions/70719678/html5-video-autoplay-with-sound-unmuted
 *
 *  상호작용이란 탭 포커스 혹은 화면 클릭 등을 뜻하며, 이는 즉
 *    case 1. 파티룸 로비에서 파티룸으로 진입 시 - autoplay가능
 *    case 2. 파티룸에서 새로고침 시 - autoplay불가능
 *    case 3. 파티룸 숏링크로 진입 시 - autoplay불가능
 *  라는 뜻이 됩니다.
 *
 *  그럼, '최초 클릭 여부'를 관측하여 파티룸 진입 시점에 최초 클릭이 발생하지 않은 상태일 경우,
 *  뭔가 레코드판 같은걸 보여준 뒤 클릭하면 애니메이션과 함께 진입하는 인터랙션을 나오게 하는 등의 방법으로
 *  어색함 없이 이 문제를 해결할 수 있을 듯 합니다.
 *
 *  해당 작업 전에는 위 case 2,3 의 경우 chrome에서 autoplay가 불가능하니 참고해주세요.
 */
export default function Video({ width, height = width * DEFAULT_H_RATIO }: Props) {
  const { useCurrentPartyroom } = useStores();
  const { playback } = useCurrentPartyroom((state) => pick(state, ['playback', 'currentDj', 'me']));
  const videoId = playback?.linkId;

  const [played, setPlayed] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const playable = !!videoId && playerReady;

  const onPlayerReady = (player: TReactPlayer) => {
    // NOTE: onReady는 미디어가 재생 준비되었을 때 호출되므로, 이 콜백이 실행되었다는건 playback.linkId가 존재한다는 것을 의미함
    const initialSeek = Playback.getInitialSeek(playback as PartyroomPlayback);

    player.seekTo(initialSeek, 'seconds');
    player.forceUpdate();

    setPlayerReady(true);
  };

  const onPlay = () => {
    setPlayed(true);
  };

  return (
    <>
      {!playable && (
        <div style={{ width, height }} className='bg-black'>
          {!!playback && <LoadingPanel />}
        </div>
      )}

      <YoutubePlayer
        key={`video-${videoId}-${playerReady}-${played}`} // 상태 변경 시 플레이어 강제 리렌더링을 위한 key
        playing={playerReady}
        width={width}
        height={height}
        url={`https://www.youtube.com/watch?v=${videoId}`}
        className={cn('bg-black border border-gray-800 rounded select-none', {
          /**
           *  재생 가능한 상태가 아닐 때는 숨김 처리
           */
          hidden: !playable,
          /**
           * 원하는 재생 조건에서 controls:0 이 작동 안하므로, 대체재로 pointer-events-none을 사용
           * played가 조건문으로 들어간 이유는, 크롬에서 사용자와의 상호작용 없이 비디오가 렌더되어 autoplay가 막혔을 경우 사용자가 직접 최초 play버튼을 눌러야 하기 때문.
           * 나중에 맨 위 주석에 설명한대로 상호작용 누락에 대한 대체제가 나오면 played 조건문은 빠져도 됨
           */
          'pointer-events-none': played,
        })}
        onReady={onPlayerReady}
        onPlay={onPlay}
        config={config}
        pip={false}
      />
    </>
  );
}

const DEFAULT_H_RATIO = 288 / 512;

/**
 * @see https://developers.google.com/youtube/player_parameters?playerVersion=HTML5&hl=ko
 */
const config: YouTubeConfig = {
  playerVars: {
    // Hide controls
    controls: 0,
    autoplay: 1,
    // showinfo: 0, >> @deprecated
    // Hide YouTube logo
    modestbranding: 1,
    // Hide related videos at the end
    rel: 0,
    // Auto-hide controls
    autohide: 1,
  },
};
