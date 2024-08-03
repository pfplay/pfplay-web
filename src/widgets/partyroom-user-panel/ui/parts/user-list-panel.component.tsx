import { useMemo } from 'react';
import { useFetchParticipants } from '@/features/partyroom/list-participants';
import { fixtureMenuItems } from '@/shared/api/http/__fixture__/menu-items.fixture';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { CollapseList } from '@/shared/ui/components/collapse-list';
import { UserListItem } from '@/shared/ui/components/user-list-item';
import { renderUserListItemSuffix } from '../../model/render-suffix';
import { categorizeParticipantsByGrade } from '../../model/user-list-panel.model';

const UserListPanel = () => {
  const t = useI18n();
  const participants = useFetchParticipants();

  // TODO: 임시적용. 추후 dj 정보 Get, partyroom입장시 내 정보 + memberId 받아오는 api 적용 시 수정 필요. 논의 쓰레드: https://pfplay.slack.com/archives/C03Q28EAU66/p1722694732255029
  // const { data: me } = useSuspenseFetchMe();
  const { useCurrentPartyroom } = useStores();
  const { me } = useCurrentPartyroom();
  const dj = {
    memberId: 2,
  };

  const categorizedParticipants = useMemo(() => {
    return categorizeParticipantsByGrade({
      participants,
      meId: me?.memberId,
      djId: dj.memberId,
    });
  }, [participants, me?.memberId, dj.memberId]);

  return (
    <div className='flex flex-col gap-6'>
      {Object.entries(categorizedParticipants).map(([category, participants]) => {
        return (
          <CollapseList key={category} title={category}>
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

export default UserListPanel;
