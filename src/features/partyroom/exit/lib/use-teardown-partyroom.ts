import { usePartyroomClient } from '@/entities/partyroom-client';
import { trackPartyroomExited } from '@/shared/lib/analytics/room-tracking';
import { useStores } from '@/shared/lib/store/stores.context';

/**
 * 클라이언트 측 파티룸 정리만 수행합니다(구독 해제 + 스토어 리셋 + 분석).
 *
 * 백엔드 exit(DELETE /crews/me)는 호출하지 않습니다. 언로드/언마운트/인앱 네비게이션 등
 * 비자발적 이탈은 서버의 presence grace window가 처리하며, 백엔드 exit은 명시적/의도적
 * 행위(룸 전환 = 서버 측 auto-exit, 사인아웃, 패널티/강퇴 = 서버 측)에서만 발생합니다.
 */
export function useTeardownPartyroom(partyroomId: number) {
  const client = usePartyroomClient();
  const { useCurrentPartyroom } = useStores();
  const [resetPartyroomStore] = useCurrentPartyroom((state) => [state.reset]);

  return () => {
    trackPartyroomExited(partyroomId);
    client.unsubscribeCurrentRoom();
    resetPartyroomStore(); // NOTE: 순서 의존성 없음(unsubscribeCurrentRoom은 스토어 비의존). 리셋을 마지막에 둔 건 가독성/삭제된 useExitPartyroom과의 형태 일치 목적뿐.
  };
}
