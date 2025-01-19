import { useAdjustGrade, useCanAdjustGrade } from '@/features/partyroom/adjust-grade';
import { useBlockCrew } from '@/features/partyroom/block-crew';
import { useCanImposePenalty, useImposePenalty } from '@/features/partyroom/impose-penalty';
import { Crews, useCurrentPartyroomCrews } from '@/features/partyroom/list-crews';
import { PenaltyType } from '@/shared/api/http/types/@enums';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { CollapseList } from '@/shared/ui/components/collapse-list';
import { UserListItem, UserListItemSuffix } from '@/shared/ui/components/user-list-item';

export default function AllCrewsPanel() {
  const t = useI18n();
  const crews = useCurrentPartyroomCrews();
  const adjustGrade = useAdjustGrade();
  const canAdjustGrade = useCanAdjustGrade();
  const canImposePenalty = useCanImposePenalty();
  const imposePenalty = useImposePenalty();
  const blockCrew = useBlockCrew();
  const [me, currentDj] = useStores().useCurrentPartyroom((state) => [state.me, state.currentDj]);

  return (
    <div className='flex flex-col gap-6'>
      {Object.entries(Crews.categorizeByGradeType(crews)).map(([category, crews]) => (
        <CollapseList key={'AllCrewsPanel' + category} title={category} displaySuffix={false}>
          {crews.map((crew) => {
            const _canImposePenalty = canImposePenalty(crew.gradeType);
            const onClickImposePenalty = (penaltyType: PenaltyType) => {
              imposePenalty({
                crewId: crew.crewId,
                crewGradeType: crew.gradeType,
                nickname: crew.nickname,
                penaltyType,
              });
            };

            const suffix = (() => {
              if (currentDj?.crewId === crew.crewId) {
                return <UserListItemSuffix type='tag' value='DJing' />;
              }
              if (me?.crewId === crew.crewId) {
                return <UserListItemSuffix type='tag' value='Me' />;
              }
            })();

            return (
              <UserListItem
                key={crew.crewId}
                userListItemConfig={crew}
                menuItemList={[
                  {
                    label: t.common.btn.authority,
                    onClickItem: () => adjustGrade(crew),
                    visible: canAdjustGrade(crew.gradeType),
                  },
                  {
                    label: 'GGUL', // TODO: i18n 적용
                    onClickItem: () => onClickImposePenalty(PenaltyType.CHAT_BAN_30_SECONDS),
                    visible: _canImposePenalty,
                  },
                  {
                    label: 'Kick', // TODO: i18n 적용
                    onClickItem: () => onClickImposePenalty(PenaltyType.ONE_TIME_EXPULSION),
                    visible: _canImposePenalty,
                  },
                  {
                    label: 'Ban', // TODO: i18n 적용
                    onClickItem: () => onClickImposePenalty(PenaltyType.PERMANENT_EXPULSION),
                    visible: _canImposePenalty,
                  },
                  {
                    label: 'Block', // TODO: i18n 적용
                    onClickItem: () => blockCrew({ crewId: crew.crewId }),
                  },
                ]}
                menuItemPanelSize='sm'
                suffix={suffix && { type: 'tag', Component: suffix }}
                menuDisabled={me?.crewId === crew.crewId}
              />
            );
          })}
        </CollapseList>
      ))}
    </div>
  );
}
