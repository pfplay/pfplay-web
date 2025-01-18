import { Crew, useOpenGradeAdjustmentAlertDialog } from '@/entities/current-partyroom';
import useCanAdjustGrade from '@/features/partyroom/adjust-grade/api/use-can-adjust-grade.hook';
import { PartyroomCrew } from '@/shared/api/http/types/partyrooms';
import { useStores } from '@/shared/lib/store/stores.context';
import { useSelectGrade } from './use-select-grade.hook';
import { useAdjustGrade as useAdjustGradeMutation } from '../api/use-adjust-grade.mutation';

export function useAdjustGrade() {
  const openGradeAdjustmentAlertDialog = useOpenGradeAdjustmentAlertDialog();
  const { mutate } = useAdjustGradeMutation();
  const selectGrade = useSelectGrade();
  const { me, partyroomId } = useStores().useCurrentPartyroom((state) => ({
    me: state.me,
    partyroomId: state.id,
  }));
  const canAdjustGrade = useCanAdjustGrade();

  return async (targetCrew: Pick<PartyroomCrew, 'nickname' | 'crewId' | 'gradeType'>) => {
    if (!partyroomId || !me || !canAdjustGrade(targetCrew.gradeType)) return;

    // Select grade
    const currentGrade = targetCrew.gradeType;
    const selectedGrade = await selectGrade({
      targetNickname: targetCrew.nickname,
      options: Crew.Permission.of(me.gradeType).adjustableGrades,
      current: currentGrade,
    });
    if (!selectedGrade) return; // Cancel
    if (selectedGrade === currentGrade) return; // Selected same grade

    // Adjust grade
    mutate(
      {
        partyroomId,
        crewId: targetCrew.crewId,
        gradeType: selectedGrade,
      },
      {
        onSuccess: () => {
          openGradeAdjustmentAlertDialog(currentGrade, selectedGrade);
        },
      }
    );
  };
}
