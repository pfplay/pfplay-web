import { RegulationType } from '@/shared/api/http/types/@enums';
import { RegulationEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useRegulationCallback() {
  const { useCurrentPartyroom } = useStores();
  const updateMembers = useCurrentPartyroom((state) => state.updateMembers);

  return (event: RegulationEvent) => {
    switch (event.regulationType) {
      case RegulationType.GRADE:
        // TODO: “채팅 공지 알림“과 “대상자에게 모달 알림“ 기능 구현
        updateMembers((prev) => {
          return prev.map((member) => {
            if (member.memberId === event.member.memberId) {
              return {
                ...member,
                gradeType: event.member.currGradeType,
              };
            }
            return member;
          });
        });
        break;
      // TODO: RegulationType.PENALTY 케이스 처리
    }
  };
}
