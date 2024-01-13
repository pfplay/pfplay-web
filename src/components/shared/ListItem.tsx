import { cn } from '@/utils/cn';
import Typography, { typoStyleDict } from './atoms/Typography';

export type Article = {
  title: string;
  content?: string | string[];
  tail?: string | string[];
  listType?: ListType;
  items?: ListItemType[];
};

export type ListType = 'list-disc' | 'list-decimal' | 'list-inherit' | 'list-latin';
export type ListItemType = {
  content?: string | string[];
  listHead?: string;
  listType?: ListType;
  subItems?: ListItemType[];
};
interface ClauseProps {
  item: ListItemType;
}

const ListItem = ({ item }: ClauseProps) => {
  return (
    <>
      {item?.listHead && (
        <Typography type='caption2' className='text-gray-300 mt-4'>
          {item?.listHead}
        </Typography>
      )}
      <div className={cn('flexCol items-start', !item?.listHead ? 'ml-5' : 'ml-2')}>
        {typeof item.content === 'string' && (
          <li className={cn('text-gray-300', typoStyleDict.caption2)}>
            {item.content}
            {item.subItems && (
              <ul className={cn('', item?.listType)}>
                {item.subItems.map((subItem) => (
                  <ListItem key={crypto.randomUUID()} item={subItem} />
                ))}
              </ul>
            )}
          </li>
        )}
        {/* TODO: 수정 필요 */}
        {Array.isArray(item.content) && (
          <div className='flexCol ml-[10px]'>
            {item.content.map((contentItem) => (
              <li key={crypto.randomUUID()} className={cn('text-gray-300', typoStyleDict.caption2)}>
                {contentItem}
              </li>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ListItem;
