import { useMemo } from 'react';
import { useFetchParticipants } from '@/features/partyroom/list-participants';
import { fixtureMenuItems } from '@/shared/api/http/__fixture__/menu-items.fixture';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { CollapseList } from '@/shared/ui/components/collapse-list';
import { UserListItem, UserListItemSuffix } from '@/shared/ui/components/user-list-item';
import { categorizeParticipantsByGrade } from '../../model/user-grade-panel.model';

const UserGradePanel = () => {
  const t = useI18n();
  const participants = useFetchParticipants();
  const { useCurrentPartyroom } = useStores();
  const { me, currentDj } = useCurrentPartyroom();

  const categorizedParticipants = useMemo(() => {
    return categorizeParticipantsByGrade({
      participants,
    });
  }, [participants]);

  return (
    <div className='flex flex-col gap-6'>
      {Object.entries(categorizedParticipants).map(([category, participants]) => {
        return (
          <CollapseList key={category} title={category} displaySuffix={false}>
            {participants.map((participant) => {
              const Suffix = (() => {
                if (currentDj?.memberId === participant.memberId) {
                  // FIXME: Component value에 i18n 적용, value djing에 맞게 수정
                  return <UserListItemSuffix type='tag' value={t.common.btn.play} />;
                }
                if (me?.memberId === participant.memberId) {
                  // FIXME: Component value에 i18n 적용, value me 맞게 수정
                  return <UserListItemSuffix type='tag' value={t.common.btn.play} />;
                }
              })();

              return (
                <UserListItem
                  key={participant.memberId}
                  userListItemConfig={participant}
                  menuItemList={fixtureMenuItems}
                  menuItemPanelSize='sm'
                  suffix={Suffix && { type: 'tag', Component: Suffix }}
                />
              );
            })}
          </CollapseList>
        );
      })}
    </div>
  );
};

export default UserGradePanel;
