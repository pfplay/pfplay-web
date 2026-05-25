'use client';
import dynamic from 'next/dynamic';
import { ReactNode, useEffect, useRef, useState } from 'react';
import type TReactPlayer from 'react-player';
import { YouTubeConfig } from 'react-player/youtube';
import { Crew, Playback } from '@/entities/current-partyroom';
import { useUserPreferenceStore } from '@/entities/preference';
import { PartyroomPlayback } from '@/shared/api/http/types/partyrooms';
import { cn } from '@/shared/lib/functions/cn';
import { pick } from '@/shared/lib/functions/pick';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { LoadingPanel } from '@/shared/ui/components/loading';
import CinemaFooter from './cinema-footer.component';
import CinemaHeader from './cinema-header.component';
import { useAutoResumeOnPause } from './use-auto-resume-on-pause.hook';
import VideoControls from './video-controls.component';

const YoutubePlayer = dynamic(() => import('react-player/youtube'), { ssr: false });

type Props = {
  width: number;
  height?: number;
  headerActions?: ReactNode;
  sidebarActions?: ReactNode;
  sidePanelContent?: ReactNode;
  chatPanelContent?: ReactNode;
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
export default function Video({
  width,
  height = width * DEFAULT_H_RATIO,
  headerActions,
  sidebarActions,
  sidePanelContent,
  chatPanelContent,
}: Props) {
  const t = useI18n();
  const { useCurrentPartyroom, useUIState } = useStores();
  const { playback, crews, currentDj } = useCurrentPartyroom((state) =>
    pick(state, ['playback', 'currentDj', 'me', 'crews'])
  );
  const videoId = playback?.linkId;

  const volume = useUserPreferenceStore((s) => s.volume);
  const muted = useUserPreferenceStore((s) => s.muted);

  const cinemaView = useUIState((s) => s.cinemaView);
  const setCinemaView = useUIState((s) => s.setCinemaView);
  const cinemaChatOpen = useUIState((s) => s.cinemaChatOpen);
  const setCinemaChatOpen = useUIState((s) => s.setCinemaChatOpen);
  const pendingFullscreen = useUIState((s) => s.pendingFullscreen);
  const setPendingFullscreen = useUIState((s) => s.setPendingFullscreen);

  const [played, setPlayed] = useState(false);
  const [isFullscreenOverlayVisible, setIsFullscreenOverlayVisible] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  // 브라우저 autoplay 정책(Chrome MEI/Edge 차이)으로 새로고침·숏링크 진입 시 muted 아닌
  // 비디오가 자동재생되지 않을 수 있다. onReady 후 일정 시간 onPlay 가 없으면 차단으로 간주하고
  // gesture gate(클릭 유도)를 띄운다. 이미 재생되는(MEI 높은) 경우엔 onPlay 가 와서 gate 미표시.
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const playerRef = useRef<TReactPlayer | null>(null);
  const playable = !!videoId && playerReady;
  const showGestureGate = playable && !played && autoplayBlocked;

  const cinemaContainerRef = useRef<HTMLDivElement>(null);
  const defaultContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  useEffect(() => {
    if (cinemaView && pendingFullscreen) {
      setPendingFullscreen(false);
      cinemaContainerRef.current?.requestFullscreen();
    }
  }, [cinemaView, pendingFullscreen, setPendingFullscreen]);

  // 현재 트랙의 라이브 위치로 seek 한다. player 준비(onReady)·트랙 변경 후 새 영상 시작(onStart) 시 호출.
  const seekToLive = () => {
    if (!playback) return;
    playerRef.current?.seekTo(Playback.getInitialSeek(playback as PartyroomPlayback), 'seconds');
  };

  const onPlayerReady = (player: TReactPlayer) => {
    // NOTE: onReady는 미디어가 재생 준비되었을 때 호출되므로, 이 콜백이 실행되었다는건 playback.linkId가 존재한다는 것을 의미함
    playerRef.current = player;
    seekToLive();
    player.forceUpdate();
    setPlayerReady(true);
  };

  // 트랙이 바뀌어도 player 를 remount 하지 않고(key 에 videoId/endTime 미포함) react-player 가 같은
  // 인스턴스에 다음 영상을 load 한다. remount 가 없어야 백그라운드 탭에서도 새 트랙 autoplay 가 차단되지
  // 않고 재생이 이어진다. 새 영상이 시작되면(onStart) 라이브 위치로 맞춘다.
  const onStart = () => {
    seekToLive();
  };

  const onPlay = () => {
    setPlayed(true);
    setAutoplayBlocked(false);
  };

  // autoplay 차단 감지: onReady(playerReady) 후 일정 시간 onPlay(played) 가 없으면 차단으로 간주.
  // 트랙(videoId)이 바뀌면 다시 판정.
  useEffect(() => {
    if (!playerReady || played) return;
    const timer = setTimeout(() => setAutoplayBlocked(true), AUTOPLAY_DETECT_MS);
    return () => clearTimeout(timer);
  }, [playerReady, played, videoId]);

  // 사용자 제스처(클릭)로 재생을 트리거한다. 이 클릭이 브라우저가 요구하는 user activation 이 되어
  // autoplay 차단이 풀린다. YouTube internal player 의 playVideo() 직접 호출.
  const handleGesturePlay = () => {
    const internal = playerRef.current?.getInternalPlayer() as
      | { playVideo?: () => void }
      | undefined;
    internal?.playVideo?.();
    setAutoplayBlocked(false);
  };

  // 블루투스 이어폰 제거 등 외부 인터럽트로 자동 일시정지되면 무인터랙션으로 재개를 시도하고(이슈 #334),
  // 정책상 차단되면(주로 Safari) played 를 풀어 player 를 재마운트하면서 gesture gate 로 폴백한다.
  const onPause = useAutoResumeOnPause(playerRef, {
    enabled: playable,
    onFallback: () => {
      setPlayed(false);
      setAutoplayBlocked(true);
    },
  });

  const handleTheater = () => setCinemaView(true);

  const handleFull = () => {
    if (cinemaView) {
      cinemaContainerRef.current?.requestFullscreen();
    } else {
      setPendingFullscreen(true);
      setCinemaView(true);
    }
  };

  const handleDefault = () => {
    if (isFullscreen) document.exitFullscreen();
    setCinemaView(false);
    setCinemaChatOpen(false);
  };

  const handleToggleChat = () => setCinemaChatOpen(!cinemaChatOpen);

  const djCrew = currentDj
    ? crews.find((crew: Crew.Model) => crew.crewId === currentDj.crewId)
    : undefined;

  const playerClass = cn('bg-black border border-gray-800 rounded select-none', {
    hidden: !playable,
    'pointer-events-none': played,
  });

  const gestureGate = showGestureGate ? (
    <button
      type='button'
      onClick={handleGesturePlay}
      data-testid='autoplay-gesture-gate'
      aria-label={t.party.btn.click_to_play}
      className='absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/70 cursor-pointer'
    >
      <span className='flex items-center justify-center w-16 h-16 rounded-full bg-white/90'>
        <svg width='28' height='28' viewBox='0 0 24 24' fill='black' aria-hidden>
          <path d='M8 5v14l11-7z' />
        </svg>
      </span>
      <span className='text-sm text-gray-100'>{t.party.btn.click_to_play}</span>
    </button>
  ) : null;

  const cinemaPlayer = (
    <div className='relative w-full h-full'>
      {!playable && <div className='w-full h-full bg-black'>{!!playback && <LoadingPanel />}</div>}
      <YoutubePlayer
        key={`video-${playerReady}-${played}`}
        playing={playerReady}
        volume={muted ? 0 : volume}
        muted={muted}
        width='100%'
        height='100%'
        url={`https://www.youtube.com/watch?v=${videoId}`}
        className={playerClass}
        onReady={onPlayerReady}
        onStart={onStart}
        onPlay={onPlay}
        onPause={onPause}
        config={config}
        pip={false}
      />
      {gestureGate}
    </div>
  );

  if (cinemaView) {
    // Full-screen mode: video fills entire viewport, header/footer appear only on hover over their zones
    if (isFullscreen) {
      return (
        <div ref={cinemaContainerRef} className='fixed inset-0 z-[100] bg-black'>
          {/* Video fills everything */}
          <div className='absolute inset-0'>{cinemaPlayer}</div>

          {/* Header hover zone — covers the top strip; content fades in on hover */}
          <div
            className='absolute top-0 inset-x-0 h-20 z-10'
            onMouseEnter={() => setIsFullscreenOverlayVisible(true)}
            onMouseLeave={() => setIsFullscreenOverlayVisible(false)}
          >
            <div
              className={cn(
                'absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-black/90 to-transparent border-b border-gray-800/60 transition-opacity duration-300',
                isFullscreenOverlayVisible ? 'opacity-100' : 'opacity-0'
              )}
            >
              <CinemaHeader sidebarActions={sidebarActions} headerActions={headerActions} />
            </div>
          </div>

          {/* Footer hover zone — covers the bottom strip (tall enough for DJ avatar) */}
          <div
            className='absolute bottom-0 inset-x-0 h-[220px] z-10'
            onMouseEnter={() => setIsFullscreenOverlayVisible(true)}
            onMouseLeave={() => setIsFullscreenOverlayVisible(false)}
          >
            <div
              className={cn(
                'absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent border-t border-gray-800/60 transition-opacity duration-300',
                isFullscreenOverlayVisible ? 'opacity-100' : 'opacity-0'
              )}
            >
              <CinemaFooter
                djCrew={djCrew}
                isFullscreen={isFullscreen}
                cinemaChatOpen={cinemaChatOpen}
                onDefault={handleDefault}
                onFull={handleFull}
                onToggleChat={handleToggleChat}
              />
            </div>
          </div>
        </div>
      );
    }

    // Cinema mode (not fullscreen): left column shrinks when chat panel opens on right
    return (
      <div ref={cinemaContainerRef} className='fixed inset-0 z-[100] bg-black flex flex-row'>
        <div className='flex-1 min-w-0 flex flex-col'>
          {/* Header */}
          <div className='shrink-0 bg-black border-b border-gray-800'>
            <CinemaHeader sidebarActions={sidebarActions} headerActions={headerActions} />
          </div>

          {/* Middle: video + optional side panel */}
          <div className='flex-1 flex flex-row min-h-0'>
            <div className='flex-1 relative min-h-0 min-w-0'>{cinemaPlayer}</div>
            {sidePanelContent && (
              <div className='w-[360px] shrink-0 bg-black border-l border-gray-800 overflow-y-auto'>
                {sidePanelContent}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='shrink-0 bg-black border-t border-gray-800'>
            <CinemaFooter
              djCrew={djCrew}
              isFullscreen={isFullscreen}
              cinemaChatOpen={cinemaChatOpen}
              onDefault={handleDefault}
              onFull={handleFull}
              onToggleChat={handleToggleChat}
            />
          </div>
        </div>

        {/* Right: chat panel — causes entire left area to shrink */}
        {chatPanelContent && (
          <div className='w-[400px] shrink-0 bg-black border-l border-gray-800 flex flex-col'>
            {chatPanelContent}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={defaultContainerRef} className='group relative bg-black' style={{ width, height }}>
      {!playable && (
        <div style={{ width, height }} className='bg-black'>
          {!!playback && <LoadingPanel />}
        </div>
      )}

      <YoutubePlayer
        key={`video-${playerReady}-${played}`}
        playing={playerReady}
        volume={muted ? 0 : volume}
        muted={muted}
        width={width}
        height={height}
        url={`https://www.youtube.com/watch?v=${videoId}`}
        className={playerClass}
        onReady={onPlayerReady}
        onStart={onStart}
        onPlay={onPlay}
        onPause={onPause}
        config={config}
        pip={false}
      />

      {playable && <VideoControls onTheater={handleTheater} onFull={handleFull} />}
      {gestureGate}
    </div>
  );
}

const DEFAULT_H_RATIO = 288 / 512;
// onReady 후 이 시간 내 onPlay 가 없으면 autoplay 차단으로 간주하고 gesture gate 표시.
// 네트워크 지연으로 인한 false positive 와 차단 감지 지연의 트레이드오프 — 로컬 브라우저 검증으로 튜닝.
const AUTOPLAY_DETECT_MS = 1500;

/**
 * @see https://developers.google.com/youtube/player_parameters?playerVersion=HTML5&hl=ko
 */
const config: YouTubeConfig = {
  playerVars: {
    controls: 0,
    autoplay: 1,
    modestbranding: 1,
    rel: 0,
    autohide: 1,
  },
};
