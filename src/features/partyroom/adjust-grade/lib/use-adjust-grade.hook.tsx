import { Crew } from '@/entities/current-partyroom';
import { PartyroomCrew } from '@/shared/api/http/types/partyrooms';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { useDialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';
import { PFChevronRight } from '@/shared/ui/icons';
import { useSelectGrade } from './use-select-grade.hook';
import { useAdjustGrade as useAdjustGradeMutation } from '../api/use-adjust-grade.mutation';
import { GRADE_TYPE_LABEL } from '../config/grade-type-label';

export function useAdjustGrade() {
  const t = useI18n();
  const { openAlertDialog } = useDialog();
  const { mutate } = useAdjustGradeMutation();
  const selectGrade = useSelectGrade();
  const { useCurrentPartyroom } = useStores();
  const { me, partyroomId } = useCurrentPartyroom((state) => ({
    me: state.me,
    partyroomId: state.id,
  }));

  return async (targetCrew: Pick<PartyroomCrew, 'nickname' | 'crewId' | 'gradeType'>) => {
    if (!me || !partyroomId) return;

    const permissions = Crew.Permission.of(me.gradeType);
    const canAdjustGrade = permissions?.canAdjustGrade(targetCrew.gradeType);

    if (!canAdjustGrade) return;

    // Select grade
    const targetCurrentGrade = targetCrew.gradeType;
    const selectedGrade = await selectGrade({
      targetNickname: targetCrew.nickname,
      options: permissions.adjustableGrades,
      current: targetCurrentGrade,
    });
    if (!selectedGrade) return; // Cancel
    if (selectedGrade === targetCurrentGrade) return; // Selected same grade

    // Adjust grade
    mutate(
      {
        partyroomId,
        crewId: targetCrew.crewId,
        gradeType: selectedGrade,
      },
      {
        onSuccess: () => {
          openAlertDialog({
            title: t.auth.para.auth_changed,
            content: (
              <Typography type='body3' className='flexRowCenter gap-3'>
                <span>{`'${GRADE_TYPE_LABEL[targetCurrentGrade]}'`}</span>
                <PFChevronRight className='text-gray-200' />
                <span className='text-red-300'>{`'${GRADE_TYPE_LABEL[selectedGrade]}'`}</span>
              </Typography>
            ),
          });
        },
      }
    );
  };
}
