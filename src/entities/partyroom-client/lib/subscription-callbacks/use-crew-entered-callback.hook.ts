import { MotionType } from '@/shared/api/http/types/@enums';
import { PartyroomCrew } from '@/shared/api/http/types/partyrooms';
import { CrewEnteredEvent } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';

export default function useCrewEnteredCallback() {
  const { useCurrentPartyroom } = useStores();
  const [updateCrews, appendChatMessage] = useCurrentPartyroom((state) => [
    state.updateCrews,
    state.appendChatMessage,
  ]);

  return (event: CrewEnteredEvent) => {
    const crew = flattenCrewFromEvent(event.crew);
    const { crews } = useCurrentPartyroom.getState();
    const isNewCrew = !crews.some((prevCrew) => prevCrew.crewId === crew.crewId);

    updateCrews((prev) => {
      const existingCrew = prev.find((prevCrew) => prevCrew.crewId === crew.crewId);

      if (!existingCrew) {
        return [...prev, { ...crew, motionType: MotionType.NONE }];
      }

      return prev.map((prevCrew) =>
        prevCrew.crewId === crew.crewId
          ? { ...prevCrew, ...crew, motionType: prevCrew.motionType }
          : prevCrew
      );
    });

    if (isNewCrew) {
      appendChatMessage({
        from: 'system',
        variant: 'presence',
        i18nKey: 'chat.para.crew_entered',
        values: { nickname: crew.nickname },
        receivedAt: Date.now(),
      });
    }
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
  };
}
