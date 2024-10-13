import { useState } from 'react';
import { GRADE_TYPE_LABEL } from '@/entities/current-partyroom';
import { GradeType } from '@/shared/api/http/types/@enums';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { replaceVar } from '@/shared/lib/localization/split-render';
import { Dialog, useDialog } from '@/shared/ui/components/dialog';
import { Select } from '@/shared/ui/components/select';
import { Tag } from '@/shared/ui/components/tag';
import { Typography } from '@/shared/ui/components/typography';

export function useSelectGrade() {
  const t = useI18n();
  const { openDialog } = useDialog();

  return ({
    targetNickname,
    options,
    current,
  }: {
    targetNickname: string;
    options: GradeType[];
    current: GradeType;
  }) => {
    return openDialog<GradeType>((onOk, onClose) => ({
      title: ({ defaultTypographyType, defaultClassName }) => (
        <Typography type={defaultTypographyType} className={defaultClassName}>
          {replaceVar(t.auth.title.set_nickname, {
            $1: <span className='text-red-300'>{`'${targetNickname}'`}</span>,
          })}
        </Typography>
      ),
      Body: () => {
        const [selected, setSelected] = useState<GradeType>(current);

        return (
          <>
            <Select<GradeType>
              defaultValue={current}
              onChange={setSelected}
              options={options.map((gradeType) => ({
                value: gradeType,
                label: GRADE_TYPE_LABEL[gradeType],
                prefix:
                  gradeType === current ? (
                    <Tag value={t.auth.title.current} variant='outlined' />
                  ) : undefined,
              }))}
            />

            <Dialog.ButtonGroup>
              <Dialog.Button color='secondary' onClick={onClose}>
                {t.common.btn.cancel}
              </Dialog.Button>
              <Dialog.Button onClick={() => onOk(selected)}>{t.common.btn.confirm}</Dialog.Button>
            </Dialog.ButtonGroup>
          </>
        );
      },
    }));
  };
}
