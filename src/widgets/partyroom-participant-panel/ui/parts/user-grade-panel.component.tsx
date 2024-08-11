import { useMemo } from 'react';
import { useFetchDjingQueue } from '@/features/partyroom/list-djing-queue';
import { useFetchParticipants } from '@/features/partyroom/list-participants';
import { fixtureMenuItems } from '@/shared/api/http/__fixture__/menu-items.fixture';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { CollapseList } from '@/shared/ui/components/collapse-list';
import { UserListItem } from '@/shared/ui/components/user-list-item';
import { renderUserListItemSuffix } from '../../model/render-suffix';
import { categorizeParticipantsByGrade } from '../../model/user-grade-panel.model';

const UserGradePanel = () => {
  const t = useI18n();
  const participants = useFetchParticipants();
  const { useCurrentPartyroom } = useStores();
  const { me, id } = useCurrentPartyroom();
  const { data: djingQueue } = useFetchDjingQueue({ partyroomId: Number(id) }, true);
  const [currentDj] = djingQueue?.djs.slice().sort((a, b) => a.orderNumber - b.orderNumber) ?? [];

  const categorizedParticipants = useMemo(() => {
    return categorizeParticipantsByGrade({
      participants,
      meId: me?.memberId,
      djId: currentDj?.djId,
    });
  }, [participants, me?.memberId, currentDj?.djId]);

  return (
    <div className='flex flex-col gap-6'>
      {Object.entries(categorizedParticipants).map(([category, participants]) => {
        return (
          <CollapseList key={category} title={category} displaySuffix={false}>
            {participants.map((participant) => {
              return (
                <UserListItem
                  key={participant.memberId}
                  userListItemConfig={participant}
                  menuItemList={fixtureMenuItems}
                  menuItemPanelSize='sm'
                  suffix={renderUserListItemSuffix({
                    me: participant.isMe,
                    djing: participant.isDjing,
                    t,
                  })}
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
