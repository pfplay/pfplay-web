import { CrewGradeEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useCrewGradeCallback() {
  const { useCurrentPartyroom } = useStores();
  const updateCrews = useCurrentPartyroom((state) => state.updateCrews);

  return (event: CrewGradeEvent) => {
    // TODO: “채팅 공지 알림“과 “대상자에게 모달 알림“ 기능 구현
    updateCrews((prev) => {
      return prev.map((crew) => {
        if (crew.crewId === event.adjusted.crewId) {
          return {
            ...crew,
            gradeType: event.adjusted.currGradeType,
          };
        }
        return crew;
      });
    });
  };
}
