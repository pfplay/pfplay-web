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
    // #412: 입장 공지는 '새 입장'만 — 재입장/spurious ENTER(이미 crews 에 있는 경우)와
    // 본인 입장은 제외한다. 판정은 updateCrews 전 현재 스토어 상태로 한다.
    const { crews, me } = useCurrentPartyroom.getState();
    const isNewEntry = !crews.some((prevCrew) => prevCrew.crewId === crew.crewId);

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

    if (isNewEntry && me?.crewId !== crew.crewId) {
      appendChatMessage({
        from: 'system',
        content: `${crew.nickname}님이 입장했습니다`,
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
