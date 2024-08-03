'use client';
import { useQueryClient } from '@tanstack/react-query';
import { Me } from '@/entities/me';
import { fixtureMenuItems } from '@/shared/api/http/__fixture__/menu-items.fixture';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { Participant } from '@/shared/api/http/types/partyroom';
import { Categorized } from '@/shared/lib/functions/categorize';
import { CollapseList } from '@/shared/ui/components/collapse-list';
import { UserListItem } from '@/shared/ui/components/user-list-item';
import { renderUserListItemSuffix } from '../model/participant-list.model';

interface Props {
  categorizedParticipants: Categorized<Participant>;
}

const ParticipantList = ({ categorizedParticipants }: Props) => {
  const queryClient = useQueryClient();
  const me = queryClient.getQueryData<Me.Model>([QueryKeys.Me]);

  return (
    <div className='flex flex-col gap-6'>
      {Object.entries(categorizedParticipants).map(([category, participants]) => {
        return (
          <CollapseList key={category} title={category}>
            {participants.map((participant) => {
              const isMe =
                participant.uid === me?.uid
                  ? {
                      value: 'Me', // i18n 적용 필요
                    }
                  : undefined;

              return (
                <UserListItem
                  key={participant.memberId}
                  userListItemConfig={participant}
                  menuItemList={fixtureMenuItems}
                  menuItemPanelSize='sm'
                  suffix={renderUserListItemSuffix({
                    me: isMe,
                    // TODO: djing, ban case 대응
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

export default ParticipantList;
