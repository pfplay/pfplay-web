import { PartyroomPlayback } from '@/shared/api/http/types/partyrooms';

export type Model = PartyroomPlayback;

/**
 * Playback 마다 종료 예정 시각과 재생 소요 시간은 고정 값이고
 * 입장 발생 시각은 클라이언트마다 달라집니다.
 * 재생 잔여 시각 = 종료 예정 시각 - 입장 발생 시각
 * 이미 재생된 시간 = 재생 소요 시간 - 재생 잔여 시각(1)
 * 이것을 정리하면 모든 사용자는
 * 이미 재생된 시간 = 재생 소요 시간 - (종료 예정 시각 - 입장 발생 시각) 연산을 하면 됩니다
 *
 * @return seek amount in seconds
 */
export function getInitialSeek(model: Model): number {
  const [minutes, seconds] = model.duration.split(':');
  const durationInSeconds = parseInt(minutes, 10) * 60 + parseInt(seconds, 10);

  const remainingTimeInSeconds = (model.endTime - Date.now()) / 1000;
  const playedTime = Math.ceil(durationInSeconds - remainingTimeInSeconds);

  return Math.max(playedTime, 0);
}
