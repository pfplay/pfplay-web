import { CrewGradeEvent } from '@/shared/api/websocket/types/partyroom';
import { errorLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';
import { useStores } from '@/shared/lib/store/stores.context';
import { GRADE_TYPE_LABEL } from '../../config/grade-type-label';

const logger = withDebugger(0);
const errorLogger = logger(errorLog);

export default function useCrewGradeCallback() {
  const { useCurrentPartyroom } = useStores();
  const [updateCrews, updateMe, appendChatMessage, alert] = useCurrentPartyroom((state) => [
    state.updateCrews,
    state.updateMe,
    state.appendChatMessage,
    state.alert,
  ]);

  // TODO: “대상자에게 모달 알림“ 기능 구현
  return (event: CrewGradeEvent) => {
    const crews = useCurrentPartyroom.getState().crews;
    const adjuster = crews.find((crew) => crew.crewId === event.adjuster.crewId);
    const adjusted = crews.find((crew) => crew.crewId === event.adjusted.crewId);

    if (!adjuster || !adjusted) {
      errorLogger('Adjuster or Adjusted not found');
      return;
    }

    updateCrews(
      crews.map((crew) => {
        if (crew.crewId === event.adjusted.crewId) {
          return {
            ...crew,
            gradeType: event.adjusted.currGradeType,
          };
        }

        return crew;
      })
    );

    appendChatMessage({
      from: 'system',
      content: (() => {
        // TODO: i18n 적용, 문구 기획 논의 필요
        const gradeTypeLabel = GRADE_TYPE_LABEL[event.adjusted.currGradeType];

        return `'${adjuster.nickname}'(이)가 '${adjusted.nickname}'의 등급을 '${gradeTypeLabel}'로 변경했습니다.`;
      })(),
      receivedAt: Date.now(),
    });

    const myCrewId = useCurrentPartyroom.getState().me?.crewId;
    if (myCrewId === event.adjusted.crewId) {
      updateMe({
        gradeType: event.adjusted.currGradeType,
      });

      alert.trigger({
        type: 'grade-adjusted',
        prev: event.adjusted.prevGradeType,
        next: event.adjusted.currGradeType,
      });
    }
  };
}
