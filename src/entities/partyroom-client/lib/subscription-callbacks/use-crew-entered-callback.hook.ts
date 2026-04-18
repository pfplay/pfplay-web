import { MotionType } from '@/shared/api/http/types/@enums';
import { PartyroomCrew } from '@/shared/api/http/types/partyrooms';
import { CrewEnteredEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useCrewEnteredCallback() {
  const { useCurrentPartyroom } = useStores();
  const updateCrews = useCurrentPartyroom((state) => state.updateCrews);

  return (event: CrewEnteredEvent) => {
    const crew = flattenCrewFromEvent(event.crew);
    updateCrews((prev) => {
      if (prev.some((c) => c.crewId === crew.crewId)) return prev;
      return [...prev, { ...crew, motionType: MotionType.NONE }];
    });
  };
}

/** 이벤트의 중첩 아바타 구조를 스토어의 플랫 PartyroomCrew 구조로 변환 */
function flattenCrewFromEvent(eventCrew: CrewEnteredEvent['crew']): PartyroomCrew {
  return {
    crewId: eventCrew.crewId,
    gradeType: eventCrew.gradeType,
    nickname: eventCrew.nickname,
    avatarCompositionType: eventCrew.avatar.avatarCompositionType,
    avatarBodyUri: eventCrew.avatar.avatarBodyUri,
    avatarFaceUri: eventCrew.avatar.avatarFaceUri ?? '',
    avatarIconUri: eventCrew.avatar.avatarIconUri,
    combinePositionX: eventCrew.avatar.combinePositionX,
    combinePositionY: eventCrew.avatar.combinePositionY,
    offsetX: eventCrew.avatar.offsetX,
    offsetY: eventCrew.avatar.offsetY,
    scale: eventCrew.avatar.scale,
    countryCode: eventCrew.countryCode,
  };
}
