import type TReactPlayer from 'react-player';

/**
 * react-player API 래퍼
 * 기존 video.component.tsx의 패턴을 참고하여 구현
 */
export class ReactPlayerAPI {
  private player: TReactPlayer | null = null;

  /**
   * 플레이어 인스턴스 설정
   */
  public setPlayer(player: TReactPlayer) {
    this.player = player;
  }

  /**
   * 플레이어 준비 상태 확인
   */
  public isReady(): boolean {
    return this.player !== null;
  }

  /**
   * 재생 시작
   */
  public play() {
    if (this.player) {
      // 미리보기는 처음부터 재생
      this.player.seekTo(0, 'seconds');
      this.player.forceUpdate();
    }
  }

  /**
   * 재생 중단
   */
  public stop() {
    if (this.player) {
      // 플레이어를 정지하고 처음으로 되돌림
      this.player.seekTo(0, 'seconds');
    }
  }

  /**
   * 음소거 설정
   */
  public setMuted(muted: boolean) {
    if (this.player && this.player.getInternalPlayer) {
      const internalPlayer = this.player.getInternalPlayer();
      if (internalPlayer && typeof internalPlayer.mute === 'function') {
        if (muted) {
          internalPlayer.mute();
        } else {
          internalPlayer.unMute();
        }
      }
    }
  }

  /**
   * 볼륨 설정 (0-100)
   */
  public setVolume(volume: number) {
    if (this.player && this.player.getInternalPlayer) {
      const internalPlayer = this.player.getInternalPlayer();
      if (internalPlayer && typeof internalPlayer.setVolume === 'function') {
        internalPlayer.setVolume(Math.max(0, Math.min(100, volume)));
      }
    }
  }

  /**
   * 현재 재생 시간 가져오기
   */
  public getCurrentTime(): number {
    return this.player?.getCurrentTime() || 0;
  }

  /**
   * 전체 재생 시간 가져오기
   */
  public getDuration(): number {
    return this.player?.getDuration() || 0;
  }

  /**
   * 플레이어 정리
   */
  public cleanup() {
    this.player = null;
  }
}

/**
 * 전역 플레이어 API 인스턴스
 */
export const previewPlayerAPI = new ReactPlayerAPI();
