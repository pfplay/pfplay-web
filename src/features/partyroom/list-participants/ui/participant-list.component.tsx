'use client';
import { fixtureCollapseList } from '@/shared/api/http/__fixture__/collapse-list.fixture';
import { fixtureMenuItems } from '@/shared/api/http/__fixture__/menu-items.fixture';
import { GradeType } from '@/shared/api/http/types/@enums';
import { CollapseList } from '@/shared/ui/components/collapse-list';
import { UserListItem } from '@/shared/ui/components/user-list-item';

const ParticipantList = () => {
  // const queryClient = useQueryClient();
  // const me = queryClient.getQueryData<Me.Model>([QueryKeys.Me]);

  const hasTag = false; // set tag 'Me' when user is me or 'DJing' when the user is djing

  return (
    <CollapseList title={GradeType.HOST}>
      {fixtureCollapseList.userListPanel.map((user) => (
        <UserListItem
          key={user.id}
          userListItemConfig={user}
          menuItemList={fixtureMenuItems}
          {...(hasTag
            ? {
                suffixType: 'tag',
                suffixValue: 'Me',
              }
            : {
                suffixType: 'default',
              })}
        />
      ))}
    </CollapseList>
  );
};

export default ParticipantList;
