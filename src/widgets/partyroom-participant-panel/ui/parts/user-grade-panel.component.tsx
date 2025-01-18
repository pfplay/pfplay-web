import { Crews, useCurrentPartyroomCrews } from '@/features/partyroom/list-crews';
import { fixtureMenuItems } from '@/shared/api/http/__fixture__/menu-items.fixture';
import { useStores } from '@/shared/lib/store/stores.context';
import { CollapseList } from '@/shared/ui/components/collapse-list';
import { UserListItem, UserListItemSuffix } from '@/shared/ui/components/user-list-item';

const UserGradePanel = () => {
  const crews = useCurrentPartyroomCrews();
  const { me, currentDj } = useStores().useCurrentPartyroom();

  return (
    <div className='flex flex-col gap-6'>
      {Object.entries(Crews.categorizeByGradeType(crews)).map(([category, crews]) => (
        <CollapseList key={'UserGradePanel' + category} title={category} displaySuffix={false}>
          {crews.map((crew) => {
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
                menuItemList={fixtureMenuItems}
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
};

export default UserGradePanel;
