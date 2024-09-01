import { Member } from '@/entities/current-partyroom';
import { PartyroomMember } from '@/shared/api/http/types/partyrooms';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { useDialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';
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

  return async (targetMember: Pick<PartyroomMember, 'nickname' | 'memberId' | 'gradeType'>) => {
    if (!me || !partyroomId) return;

    const permissions = Member.Permissions.of(me.gradeType);
    const canAdjustGrade = permissions?.canAdjustGrade(targetMember.gradeType);

    if (!canAdjustGrade) return;

    // Select grade
    const targetCurrentGrade = targetMember.gradeType;
    const selectedGrade = await selectGrade({
      targetNickname: targetMember.nickname,
      options: permissions.adjustableGrades,
      current: targetCurrentGrade,
    });
    if (!selectedGrade) return; // Cancel
    if (selectedGrade === targetCurrentGrade) return; // Selected same grade

    // Adjust grade
    mutate(
      {
        partyroomId,
        memberId: targetMember.memberId,
        gradeType: selectedGrade,
      },
      {
        onSuccess: () => {
          openAlertDialog({
            title: t.auth.para.auth_changed,
            content: (
              <Typography type='body3' className='flex items-center gap-3'>
                <span>{GRADE_TYPE_LABEL[targetCurrentGrade]}</span>
                <span>{GRADE_TYPE_LABEL[selectedGrade]}</span>
              </Typography>
            ),
          });
        },
      }
    );
  };
}
