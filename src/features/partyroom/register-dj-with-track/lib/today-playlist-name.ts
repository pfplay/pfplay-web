/** 'en-CA' 로케일이 곧 YYYY-MM-DD 포맷이다. 기준은 사용자 로컬 타임존. */
export function todayPlaylistName(today = new Date()) {
  return today.toLocaleDateString('en-CA');
}
