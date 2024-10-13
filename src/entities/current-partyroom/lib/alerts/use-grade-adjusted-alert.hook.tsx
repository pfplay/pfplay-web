import { useCallback } from 'react';
import { GradeType } from '@/shared/api/http/types/@enums';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';
import { PFChevronRight } from '@/shared/ui/icons';
import useAlert from './use-alert.hook';
import { GRADE_TYPE_LABEL } from '../../config/grade-type-label';
import { isGradeAdjustedAlertMessage } from '../../model/alert.model';

export default function useGradeAdjustedAlert() {
  const openGradeAdjustmentAlertDialog = useOpenGradeAdjustmentAlertDialog();

  useAlert(
    useCallback(
      (message) => {
        if (isGradeAdjustedAlertMessage(message)) {
          openGradeAdjustmentAlertDialog(message.prev, message.next);
        }
      },
      [openGradeAdjustmentAlertDialog]
    )
  );
}

export function useOpenGradeAdjustmentAlertDialog() {
  const t = useI18n();
  const { openAlertDialog } = useDialog();

  return useCallback(
    (prev: GradeType, next: GradeType) => {
      openAlertDialog({
        title: t.auth.para.auth_changed,
        content: (
          <Typography type='body3' className='flexRowCenter gap-3'>
            <span>{`'${GRADE_TYPE_LABEL[prev]}'`}</span>
            <PFChevronRight className='text-gray-200' />
            <span className='text-red-300'>{`'${GRADE_TYPE_LABEL[next]}'`}</span>
          </Typography>
        ),
      });
    },
    [t]
  );
}
