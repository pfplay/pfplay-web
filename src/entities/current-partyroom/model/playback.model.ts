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
  const currTime = new Date();
  const endTime = getFutureDateOfUtcHHMMSS(model.endTime);

  const [minutes, seconds] = model.duration.split(':');
  const durationInSeconds = parseInt(minutes, 10) * 60 + parseInt(seconds, 10);

  const remainingTimeInSeconds = (endTime.getTime() - currTime.getTime()) / 1000;
  const playedTime = Math.ceil(durationInSeconds - remainingTimeInSeconds);

  return Math.max(playedTime, 0);
}

/**
 * UTC 기준의 "hh:mm:ss" 형식의 시간을 받아서, 해당 시간을 가진 가장 가까운 미래의 Date 객체를 반환합니다.
 */
function getFutureDateOfUtcHHMMSS(hhmmss: string) {
  const currTime = new Date();
  const date = new Date(currTime.toISOString().split('T')[0] + 'T' + hhmmss + '.000Z');

  // 오늘 날짜에 hhmmss를 붙였을 때 현재 시간보다 이전이면, 다음 날로 설정
  if (+date < +currTime) {
    date.setDate(date.getDate() + 1);
  }

  return date;
}
