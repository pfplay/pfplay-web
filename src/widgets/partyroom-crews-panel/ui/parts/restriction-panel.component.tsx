import { CollapseList } from '@/shared/ui/components/collapse-list';
import { Typography } from '@/shared/ui/components/typography';
import { UserListItem } from '@/shared/ui/components/user-list-item';
import useGetRestrictionPanelListItems from '../../lib/use-get-restirction-panel-list-items.hook';

export default function RestrictionPanel() {
  const { length, categorized } = useGetRestrictionPanelListItems();

  if (!length) {
    return (
      <div className='flex-1 flexColCenter'>
        <Typography variant='body1'>There are no restrictions.</Typography>
        {/* NOTE: empty는 임시로 만듬 (피그마에 없음) */}
      </div>
    );
  }
  return (
    <div className='flex flex-col gap-6'>
      {Object.entries(categorized).map(([category, items]) => (
        <CollapseList key={'RestrictionPanel' + category} title={category} displaySuffix={false}>
          {items.map((item) => (
            <UserListItem
              key={'RestrictionPanel' + category + item.crewId}
              userListItemConfig={item}
              suffix={{
                type: 'button',
                Component: item.suffix,
              }}
            />
          ))}
        </CollapseList>
      ))}
    </div>
  );
}
