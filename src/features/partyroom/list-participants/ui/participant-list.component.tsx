'use client';
import { useQueryClient } from '@tanstack/react-query';
import { Me } from '@/entities/me';
import { fixtureMenuItems } from '@/shared/api/http/__fixture__/menu-items.fixture';
import { fixturePartyroomMembers } from '@/shared/api/http/__fixture__/partyroom-participants.fixture';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { CollapseList } from '@/shared/ui/components/collapse-list';
import { UserListItem } from '@/shared/ui/components/user-list-item';
import { getSuffixTagProps } from '../lib/get-suffix-tag-props';
import { categorizeParticipantsByGrade } from '../model/participant.model';

interface Props {
  isBanList?: boolean;
}
const ParticipantList = ({ isBanList }: Props) => {
  const queryClient = useQueryClient();
  const me = queryClient.getQueryData<Me.Model>([QueryKeys.Me]);

  const categorizedParticipants = categorizeParticipantsByGrade(fixturePartyroomMembers);
  const djing = false; // api에서 DJing 중 유저 받아오면 제거

  return (
    <div className='flex flex-col gap-6'>
      {Object.entries(categorizedParticipants).map(([grade, participants]) => {
        return (
          <CollapseList key={grade} title={grade}>
            {participants.map((participant) => {
              const isMe =
                participant.uid === me?.uid
                  ? {
                      suffixValue: 'Me', // i18n 적용 필요
                    }
                  : undefined;
              const ban = isBanList
                ? {
                    suffixValue: '해제', // i18n 적용 필요
                    onButtonClick: () => {
                      console.log(`${participant.memberId} 해제`);
                    },
                  }
                : undefined;

              return (
                <UserListItem
                  key={participant.memberId}
                  userListItemConfig={participant}
                  menuItemList={fixtureMenuItems}
                  menuItemPanelSize='sm'
                  {...getSuffixTagProps({
                    me: isMe,
                    djing,
                    ban,
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
